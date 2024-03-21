/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Word } from './entities/word.entity';
import { Model } from 'mongoose';
import { handleError } from '../helpers/handled-error';
import { WordStatsService } from 'src/word-stats/word-stats.service';


@Injectable()
export class WordService {



  constructor(
    @InjectModel('Word') private wordModel: Model<Word>,
    @InjectModel('WordStat') private wordStatModel: Model<Word>,
    private readonly wordStatsService: WordStatsService,
  ) { }

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
        throw new BadRequestException(`la palabra ya existe: ${createWordDto.word}!`);
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

  async findAll() {


    try {
      const words = await this.wordModel.find().exec();
      return words;

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
