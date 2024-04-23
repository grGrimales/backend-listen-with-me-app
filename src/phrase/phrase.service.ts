/* eslint-disable prettier/prettier */


import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePhraseDto } from './dto/create-phrase.dto';
import { UpdatePhraseDto } from './dto/update-phrase.dto';
import { handleError } from 'src/helpers/handled-error';
import { InjectModel } from '@nestjs/mongoose';
import { Story } from '../story/entities/story.entity';
import { Phrase } from './entities/phrase.entity';
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
export class PhraseService {

  constructor(
    @InjectModel('Story') private readonly storyModel: Model<Story>,
    @InjectModel('Phrase') private readonly phraseModel: Model<Phrase>,
    private readonly cloudinaryAdapter: CloudinaryAdapter,

  ) {

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

   }


  async create(createPhraseDto: CreatePhraseDto, userId: string) {

    try {
      const { originStory } = createPhraseDto;

      if(originStory){

        const storyFronDB = await this.storyModel.findOne({ _id: originStory });


        if(!storyFronDB){
          throw new BadRequestException('Story not found');
        }

      }

      const phrase = new this.phraseModel({
        ...createPhraseDto,
        user: userId,
      });

      await phrase.save();

      return {
        message: 'Phrase created successfully',
        data: phrase
      };
      
    } catch (error) {
      handleError(error);
    }

  }


  async findMyPhrasesByStory(storyId: string, userId: string) {

    try {
      const phrases = await this.phraseModel.find({ originStory: storyId, user: userId });

      return phrases;
      
    } catch (error) {
      handleError(error);
    }

  }



  async updateAudio(phraseId: string, file: Express.Multer.File) {


    try {
      const phraseDb = await this.phraseModel.findOne({ _id: phraseId });

      if(!phraseDb){
        throw new BadRequestException('Phrase not found');
      }

      const month = new Date().getMonth();
      const oldAudioPath = phraseDb.audio;

      const pathToSave = `phrases/${month}/${phraseDb.phrase}`;

      const temporalObject = await this.cloudinaryAdapter.uploadFile(file, cloudinary, ['mp3'], pathToSave);

      phraseDb.audio = temporalObject.secure_url;
      await phraseDb.save();


      if (oldAudioPath !== 'pendiente') {
        await this.cloudinaryAdapter.deleteFile(oldAudioPath, cloudinary, pathToSave);
      }

      return {
        message: 'Audio added to phrase successfully',
        data: phraseDb
      };
      
    } catch (error) {
      handleError(error);
    }
  }


  async findAll() {
    try {

      const phrases = await this.phraseModel.find();

      return {
        count: phrases.length,
        data: phrases
      };



    } catch (error) {
      handleError(error);
    }


  }

  async findMyPhrases(
    querys: IQuerys,
    userId: string) {
    try {


      const {
        orden,
        category,
        favoritos,
        total = 10,
        isAudioPending,
         isOwner,
        page ,
        limit
      
      } = querys;


      const pipeline: any[] = [{ $match: {} }];

      const validOrden = ['recientes', 'antiguas', 'aleatorias'];


      if (isAudioPending !== 'true' && isAudioPending !== 'false') {
        throw new BadRequestException(`Params isAudioPending is not valid:  (true, false)`);
      }

      if (isAudioPending == 'true') {
        console.log('isAudioPending', isAudioPending);
        pipeline.push({       $match: {
          $or: [
            { audio: 'pendiente' },
            { audio: { $exists: false } }
            
          ]
        } });
      } else if (isAudioPending === 'false') {
        pipeline.push({ $match: { audio: { $ne: 'pendiente' } } });
      }



      if (isOwner !== 'true' && isOwner !== 'false') {
        throw new BadRequestException(`Params isOwner is not valid:  (true, false)`);
      }

      if (isOwner == 'true') {
        pipeline.push({ $match: { user: new mongoose.Types.ObjectId(userId),} });
      }



      if (!validOrden.includes(orden)) {
        throw new BadRequestException(`Params orden is not valid:  (${validOrden.join(', ')})`);
      }

   


      if (orden === 'recientes') {
        pipeline.push({ $sort: { date: -1 } });
      } else if (orden === 'antiguas') {
        pipeline.push({ $sort: { date: 1 } });
      } else if (orden === 'aleatorias') {
        pipeline.push({ $sample: { size: total } });
      }


      const phrases = await this.phraseModel.aggregate(pipeline).exec();

      return {
        count: phrases.length,
        data: phrases
      };

    } catch (error) {
      handleError(error);
    }
  }



  findOne(id: number) {
    return `This action returns a #${id} phrase`;
  }

  update(id: number, updatePhraseDto: UpdatePhraseDto) {
    return `This action updates a #${id} phrase`;
  }

  remove(id: number) {
    return `This action removes a #${id} phrase`;
  }
}
