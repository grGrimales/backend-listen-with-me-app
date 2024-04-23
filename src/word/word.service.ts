/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Word } from './entities/word.entity';
import { handleError } from '../helpers/handled-error';
import { WordStatsService } from '../word-stats/word-stats.service';
import { CloudinaryAdapter } from '../plugins/cloudinary.adapter';
import {  v2 as cloudinary } from 'cloudinary';
import mongoose, { Model } from 'mongoose';

interface IQuerys {
  orden: string;
  category?: string,
  search?: string,
  favoritos?: string,
  total?: number,
  isAudioPending?: string,
  isOwner?: string,
  page?: number,
  limit?: number

}


@Injectable()
export class WordService {



  constructor(
    @InjectModel('Word') private wordModel: Model<Word>,
    @InjectModel('WordStat') private wordStatModel: Model<Word>,
    private readonly wordStatsService: WordStatsService,
    private readonly cloudinaryAdapter: CloudinaryAdapter,


  ) {


    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  }

  async create(createWordDto: CreateWordDto, userId: string) {

    try {

      createWordDto.word = createWordDto.word
        .trim()
        .toLowerCase()
        .replace(/[',;!?.,-]/g, '');

      // validar que sea una palabra, qu eno tenga espacios ni sea una frase
      if (createWordDto.word.split(' ').length > 1) {
        throw new BadRequestException(`la palabra no es válida: ${createWordDto.word}!`);
      }



      // Buscar si la palabra ya existe
      const wordExist = await this.wordModel.findOne({ word: createWordDto.word });

      // Si la palabra ya existe, no se puede crear
      if (wordExist) {

        this.wordStatsService.addOwner(wordExist._id, userId);

        return wordExist;
        //throw new BadRequestException(`la palabra ya existe: ${createWordDto.word}!`);
      }

      const createdWord = new this.wordModel({
        ...createWordDto,
        user: userId
      });

      await createdWord.save();


      await this.wordStatsService.addOwner(createdWord._id, userId);

      return createdWord;

    } catch (error) {
      handleError(error);
    }
  }


  async updateAudio(wordId: string, file: Express.Multer.File) {

    try {

      const wordDb = await this.wordModel.findById(wordId);

      if (!wordDb) {
        throw new BadRequestException(`la palabra no existe: ${wordId}!`);
      }

      const firstLetter = wordDb.word.charAt(0).toUpperCase();
      const pathToSave = `words/${firstLetter}/${wordDb.word}`;
      const oldAudioPath = wordDb.audio;


      const temporalObject = await this.cloudinaryAdapter.uploadFile(file, cloudinary, ['mp3'], pathToSave);

      wordDb.audio = temporalObject.secure_url;
      await wordDb.save();

      if (oldAudioPath !== 'pendiente') {
        await this.cloudinaryAdapter.deleteFile(oldAudioPath, cloudinary, pathToSave);

      }

      return wordDb;

    } catch (error) {
      handleError(error);
    }



  }


  async findAll(
    querys: IQuerys,
    userId: string
  ) {


    try {


      const {
        orden,
        category,
        favoritos,
        total = 10,
        isAudioPending, isOwner,
        page ,
        limit
      
      } = querys;


      // Validar que page y limit sean enviado
      if (!page || !limit) {
        throw new BadRequestException(`Params page and limit are required!`);
      }

      // Validar que page y limit sean numeros
      if (isNaN(page) || isNaN(limit)) {
        throw new BadRequestException(`Params page and limit must be numbers!`);
      }

    // validar que page y limit sean mayores a 0
      if (page <= 0 || limit <= 0) {
        throw new BadRequestException(`Params page and limit must be greater than 0!`);
      }

      // validar que total sea mayor a 0
      if (total <= 0) {
        throw new BadRequestException(`Params total must be greater than 0!`);
      }


      // castear page y limit a numeros
      querys.page = +page;
      querys.limit = +limit;

      const validOrden = ['recientes', 'antiguas', 'aleatorias'];


      if (!validOrden.includes(orden)) {
        throw new BadRequestException(`Params orden is not valid:  (${validOrden.join(', ')})`);
      }

      if (isAudioPending !== 'true' && isAudioPending !== 'false') {
        throw new BadRequestException(`Params isAudioPending is not valid:  (true, false)`);
      }

      if (isOwner !== 'true' && isOwner !== 'false') {
        throw new BadRequestException(`Params isOwner is not valid:  (true, false)`);
      }



      const pipeline: any[] = [{ $match: {} }];

      if (isAudioPending == 'true') {
        console.log('isAudioPending', isAudioPending);
        pipeline.push({ $match: { audio: 'pendiente' } });
      } else if (isAudioPending === 'false') {
        pipeline.push({ $match: { audio: { $ne: 'pendiente' } } });
      }


      // Is owner en true entonces solo filtra por las palabras creadas por ese usuario.

      if (isOwner == 'true') {
        pipeline.push({ $match: { user: new mongoose.Types.ObjectId(userId),} });
      }


      if (orden === 'recientes') {
        pipeline.push({ $sort: { createdAt: -1 } });
      } else if (orden === 'antiguas') {
        pipeline.push({ $sort: { createdAt: 1 } });
      } else if (orden === 'aleatorias') {
        pipeline.push({ $sample: { size: total } });
      }


      // Agregar una paginación con el total de palabras a mostrar por página  y desde que página se va a mostrar
      pipeline.push({ $skip: (page - 1) * limit });

      // const words = await this.wordModel.find().exec();
      const words = await this.wordModel.aggregate(pipeline).exec();
      return {
        total: words.length,
        page,
        limit,
        words,
      



      
      };

    } catch (error) {
      handleError(error);
    }

  }

  async findOne(id: string) {

    try {
      const wordDb = await this.wordModel
        .findById(id)
        .exec();

      if (!wordDb) {
        throw new BadRequestException(`la palabra no existe: ${id}!`);
      }

      return wordDb

        ;

    } catch (error) {
      handleError(error);

    }



  }

  async update(id: string, updateWordDto: UpdateWordDto) {


    try {

      const wordDb = await this.wordModel
        .findById(id)
        .exec();

      if (!wordDb) {
        throw new BadRequestException(`la palabra no existe: ${id}!`);
      }

      const wordExist = await this.wordModel.findOne({ word: updateWordDto.word });

      if (wordExist && wordExist._id.toString() !== id) {
        throw new BadRequestException(`la palabra ya existe: ${updateWordDto.word}!`);
      }

      const wordUpdated = await this.wordModel
        .findByIdAndUpdate(id, updateWordDto, { new: true })
        .exec();

      if (!wordUpdated) {
        throw new BadRequestException(`la palabra no se pudo actualizar: ${id}!`);
      }

      return wordUpdated;

    } catch (error) {
      handleError(error);
    }

  }

  async remove(id: string) {
    try {

      const wordDb = await this.wordModel
        .findById(id)
        .exec();

      if (!wordDb) {
        throw new BadRequestException(`la palabra no existe: ${id}!`);
      }

      const wordDeleted = await this.wordModel.deleteOne(
        { _id: id }
      ).exec();

      if (wordDeleted.deletedCount === 0) {
        throw new BadRequestException(`la palabra no se pudo eliminar: ${id}!`);
      }

      return {
        message: `la palabra se elimino correctamente: ${id}!`
      };




    } catch (error) {
      handleError(error);
    }
  }
}
