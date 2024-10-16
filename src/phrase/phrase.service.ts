/* eslint-disable prettier/prettier */


import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePhraseDto } from './dto/create-phrase.dto';
import { UpdatePhraseDto } from './dto/update-phrase.dto';
import { handleError } from '../helpers/handled-error';
import { InjectModel } from '@nestjs/mongoose';
import { Story } from '../story/entities/story.entity';
import { Phrase } from './entities/phrase.entity';
import { PlayList } from '../playlist/entities/playlist.entity';
import { CloudinaryAdapter } from '../plugins/cloudinary.adapter';
import { v2 as cloudinary } from 'cloudinary';
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
  limit?: number,
  playListId?: string


}



@Injectable()
export class PhraseService {

  constructor(
    @InjectModel('Story') private readonly storyModel: Model<Story>,
    @InjectModel('Phrase') private readonly phraseModel: Model<Phrase>,
    @InjectModel('PlayList') private readonly playlistModel: Model<PlayList>,
    private readonly cloudinaryAdapter: CloudinaryAdapter,

  ) {

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

  }


  async create(createPhraseDto: CreatePhraseDto, userId: string, playListId?: string) {

    try {
      const { originStory } = createPhraseDto;

      if (originStory) {

        const storyFronDB = await this.storyModel.findOne({ _id: originStory });


        if (!storyFronDB) {
          throw new BadRequestException('Story not found');
        }

      }

      const phrase = new this.phraseModel({
        ...createPhraseDto,
        user: userId,
      });

      await phrase.save();

      // Si el playListId existe debemos agregar la frase al play list
      if (playListId) {
        const playList = await this.playlistModel.findOne({ _id: playListId });

        if (!playList) {
          throw new BadRequestException('Playlist not found');
        }

        playList.phrases.push(phrase._id);

        await playList.save();

      }


      return {
        message: 'Phrase created successfully',
        data: phrase
      };

    } catch (error) {
      handleError(error);
    }

  }
  async createMany(createPhraseDto: CreatePhraseDto[], userId: string, playListTitle: string) {

    try {

      console.log('playListTitle', playListTitle);

      //   Validar que epl play list exista
      if (!playListTitle) {
        throw new BadRequestException('playListTitle is required');
      }

      // Validar que el play list exista en la base de datos y tenga permisos el usuario
      const playListExist = await this.playlistModel.findOne({ title: playListTitle });

      if (!playListExist) {
        throw new BadRequestException('Playlist not found');
      }



      // Validar que el usuario tenga acceso a editar el play list
      const userHasAccess = playListExist.editorUsers.find((user) => user.toString() === userId);

      if (!userHasAccess) {
        throw new BadRequestException('You do not have permission to edit this playlist');
      }




      // validar que todas las frases tengan una frase y no esten vacias
      const emptyPhrase = createPhraseDto.find((phrase) => !phrase.phrase);
      if (emptyPhrase) {

        return {
          message: 'Phrase is required',
          data: emptyPhrase
        }

      }

      // Validar que algunas de las frases no existe en la base de datos
      const phrasesExist = await this.phraseModel.find({ phrase: { $in: createPhraseDto.map((phrase) => phrase.phrase) } });
      if (phrasesExist.length) {
        return {
          message: 'Some phrases already exist',
          data: phrasesExist
        }
      }


      const createPhrasePromises = createPhraseDto.map(async (phrase) => {
        await this.create(phrase, userId, String(playListExist._id));
      });

      await Promise.all(createPhrasePromises);


      return {
        message: 'Phrases created successfully',
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

      if (!phraseDb) {
        throw new BadRequestException('Phrase not found');
      }

      const month = new Date().getMonth();
      const oldAudioPath = phraseDb.audio;

      // Limpiar phrase de signos de puntuacion, espacios y caracteres especiales
      const cleanPhrase = phraseDb.phrase.replace(/[^a-zA-Z0-9]/g, '');

      const pathToSave = `phrases/${month}/${cleanPhrase}`;

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


      // Validar que total no venga vacio y sea un numero
      if (!querys.total || isNaN(querys.total)) {
        throw new BadRequestException('Params total is required');
      }

      // Validar que total sea mayor a 0
      if (querys.total <= 0) {
        throw new BadRequestException('Params total must be greater than 0');
      }

      // Castear total a number
      querys.total = Number(querys.total);

      const {
        orden,
        category,
        favoritos,
        total,
        isAudioPending,
        isOwner,
        page,
        limit,
        playListId


      } = querys;

      const pipeline: any[] = [{ $match: {} }];

      const validOrden = ['recientes', 'antiguas', 'aleatorias', 'menos-reproducidas', 'mas-reproducidas'];




      if (isAudioPending !== 'true' && isAudioPending !== 'false') {
        throw new BadRequestException(`Params isAudioPending is not valid:  (true, false)`);
      }

      if (isAudioPending == 'true') {
        pipeline.push({
          $match: {
            $or: [
              { audio: 'pendiente' },
              { audio: { $exists: false } }

            ]
          }
        });
      } else if (isAudioPending === 'false') {
        pipeline.push({ $match: { audio: { $ne: 'pendiente' } } });
      }

/*

      if (isOwner !== 'true' && isOwner !== 'false') {
        throw new BadRequestException(`Params isOwner is not valid:  (true, false)`);
      }

      if (isOwner == 'true') {
        pipeline.push({ $match: { user: new mongoose.Types.ObjectId(userId), } });
      }
        */



      if (!validOrden.includes(orden)) {
        throw new BadRequestException(`Params orden is not valid:  (${validOrden.join(', ')})`);
      }

      // Filtrar los playbacks por usuario y si playbacks.user is null colocar de primero
      pipeline.push({
        $addFields: {
          playbacks: {
            $cond: {
              if: { $eq: [{ $type: '$playbacks' }, 'missing'] },
              then: [],
              else: '$playbacks'
            }
          }
        }
      });


      if (orden === 'recientes') {
        pipeline.push({ $sort: { date: -1 } });
      } else if (orden === 'antiguas') {
        pipeline.push({ $sort: { date: 1 } });
      } else if (orden === 'aleatorias') {
        pipeline.push({ $sample: { size: total } });
      } else if (orden === 'menos-reproducidas') {
        // Solo tomar en cuenta las frases de mi usuario actual
        pipeline.push({ $sort: { 'playbacks.count': 1 } });

      } else if (orden === 'mas-reproducidas') {
        // Solo tomar en cuenta las frases de mi usuario actual
        pipeline.push({ $sort: { 'playbacks.count': -1 } });

      }


      // Limitar el numero de frases en base a total
      //  pipeline.push({ $limit: total });


      const phrases = await this.phraseModel.aggregate(pipeline).exec();

      console.log(playListId)
      if (playListId && playListId !== 'null') {
        console.log("entra...")
        
        const playList = await this.findByPlayList(playListId, userId);

        console.log(playList)
        console.log(phrases)

 
// filtrar las frases que esten en el playList y devolver solo el total

        const phrasesFiltered = phrases.filter((phrase) => playList.phrases.includes(phrase._id)).slice(0, total);


        return {
          count: phrasesFiltered.length,
          data: phrasesFiltered,
          
        };
      } else {
        return {
          count: phrases.length,
          data: phrases
        };
      }

  

    } catch (error) {
      handleError(error);
    }
  }



  async update(id: string, updatePhraseDto: UpdatePhraseDto) {

    try {

      const { phrase, translation } = updatePhraseDto;


      const phraseUpdated = await this.phraseModel.findByIdAndUpdate(id, {
        phrase,
        translation
      }, { new: true });

      if (!phraseUpdated) {
        throw new BadRequestException('Phrase not found');
      }

      return {
        message: 'Phrase updated successfully',
        phrase: phraseUpdated
      };


    } catch (error) {
      handleError(error);
    }

  }

  async remove(phraseId: string, userId: string) {

    try {


      const phrase = await this.phraseModel.findOne({ _id: phraseId });

      if (!phrase) {
        throw new BadRequestException('Phrase not found');
      }

      // Validar que el usuario sea el dueño de la frase
      if (phrase.toJSON().user.toString() !== userId) {
        throw new BadRequestException('You are not the owner of this phrase');
      }

      await this.phraseModel.deleteOne({ _id: phraseId });

      return {
        message: 'Phrase deleted successfully',
        data: phrase
      };




    } catch (error) {
      handleError(error);
    }


  }


  // Metodo para incrementar el contador de reproducciones por usuario
  async incrementPlayback(phraseId: string, userId: string) {

    try {

      const phrase = await this.phraseModel.findOne({ _id: phraseId });

      if (!phrase) {
        throw new BadRequestException('Phrase not found');
      }

      const userExist = phrase.playbacks.find((playback) => playback.user.toString() === userId);

      if (userExist) {
        userExist.count += 1;
      } else {
        phrase.playbacks.push({ user: userId, count: 1 });
      }

      await phrase.save();

      return {
        message: 'Playback incremented successfully',
        data: phrase
      };


    } catch (error) {
      handleError(error);
    }


  }


  /* Metodo para buscar frases por play list */

  async findByPlayList(playListId: string, userId: string) {


    try {

       // validar que el playListId sea un id valido de mongo
       if (!mongoose.Types.ObjectId.isValid(playListId)) {
        throw new BadRequestException('playListId is not valid');
      }


      // Validar que el play list exista
      const playList = await this.playlistModel.findOne({ _id: playListId });

      if (!playList) {
        throw new BadRequestException('Playlist not found');
      }

      // Validar que el usuario tenga acceso a visualizar el play list

      const userHasAccess = playList.viewerUsers.find((user) => user.toString() === userId);

      if (!userHasAccess) {
        throw new BadRequestException('You do not have permission to view this playlist');
      }

      return {
        phrases: playList.phrases
      };




    } catch (error) {
      handleError(error);
    }


  }

  async getValidPlayListId(playListId: string, userId: string) {
    try {
      // validar que el playListId sea un id valido de mongo
      if (!mongoose.Types.ObjectId.isValid(playListId)) {
        throw new BadRequestException('playListId is not valid');
      }


      // Validar que el play list exista
      const playList = await this.playlistModel.findOne({ _id: playListId });

      if (!playList) {
        throw new BadRequestException('Playlist not found');
      }

      // Validar que el usuario tenga acceso a visualizar el play list

      const userHasAccess = playList.viewerUsers.find((user) => user.toString() === userId);

      if (!userHasAccess) {
        throw new BadRequestException('You do not have permission to view this playlist');
      }

      return playList;
    } catch (error) {

    }
  }

}
