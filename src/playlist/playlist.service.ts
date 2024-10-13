/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { handleError } from '../helpers/handled-error';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story } from '../story/entities/story.entity';
import { PlayList } from './entities/playlist.entity';
import { AddElementToPlaylistDto } from './dto/add-element-to-playlist-dto';
import { Phrase } from '../phrase/entities/phrase.entity';
import { Word } from '../word/entities/word.entity';
import { WordStat } from '../word-stats/entities/word-stat.entity';
import { WordStatsService } from '../word-stats/word-stats.service';
import { StoryService } from '../story/story.service';
import { title } from 'process';


@Injectable()
export class PlaylistService {


  private validOrden = ['aleatorias', 'menos-reproducidas', 'mas-reproducidas']; // TODO: agregar recientes y antiguas


  constructor(
    @InjectModel('Story') private readonly storyModel: Model<Story>,
    @InjectModel('PlayList') private readonly playListModel: Model<PlayList>,
    @InjectModel('Phrase') private readonly phraseModel: Model<Phrase>,
    @InjectModel('Word') private readonly wordModel: Model<Word>,
    @InjectModel('WordStat') private wordStatModel: Model<WordStat>,

    // WordStatsService

    private readonly wordStatsService: WordStatsService,
    private readonly storyService: StoryService,



  ) { }


  async create(createPlaylistDto: CreatePlaylistDto, userId: string) {



    try {


      const playlistExist = await this.playListModel.findOne({ title: createPlaylistDto.title, user: userId });


      if (playlistExist) {
        throw new BadRequestException('Playlist already exists');
      }

      const playlist = new this.playListModel({
        ...createPlaylistDto,
        user: userId,
        viewerUsers: [
          ...createPlaylistDto.viewerUsers,
          userId
        ],

        editorUsers: [
          ...createPlaylistDto.editorUsers,
          userId
        ],
      });

      await playlist.save();

      return playlist;



    } catch (error) {

      handleError(error);
    }



  }

  async findAllMyPlaylists(userId: string, querys: any) {

    const { type, isOwner = true } = querys;

    this.validateElementType(type);

    if (isOwner !== 'true' && isOwner !== 'false') {
      throw new BadRequestException('Invalid isOwner value should be true or false');

    }



    try {

      const pipeline: any[] = [{ $match: { user: userId, type: type } }];

      pipeline.push({ $match: { $or: [{ editorUsers: userId }, { viewerUsers: userId }] } });

      const playlists = await this.playListModel.find(
        {  type: type }


      )
        .populate('editorUsers', 'fullName email id')
        .populate('viewerUsers', 'fullName email id')
        .populate('stories')
        .populate('words');


      if (!playlists) {
        throw new BadRequestException('No playlists found');
      }

      return playlists;

    } catch (error) {
      handleError(error);
    }



  }




  validateElementType(elementType: string) {
    if (elementType !== 'Story' && elementType !== 'Word' && elementType !== 'Phrase') {
      throw new BadRequestException('Invalid element type should be Story, Phrase or Word');
    }
  }


  async addElementToPlaylist(addElementToPlaylistDto: AddElementToPlaylistDto, userId: string) {

    try {

      const { playlistId, elementId } = addElementToPlaylistDto;



      const playListFromDb = await this.playListModel.findOne({ _id: playlistId });


      if (!playListFromDb) {
        throw new BadRequestException('Playlist not found');
      }


      if (playListFromDb.user.toString() !== userId.toString() && !playListFromDb.editorUsers.map(user => user.toString()).includes(userId.toString())) {
        throw new BadRequestException('You are not allowed to add elements to this playlist');
      }


      const playListType = playListFromDb.type;

      // Si el tipo de lista es historia
      if (playListType === 'Story') {
        const story = await this.storyModel.findOne({ _id: elementId });

        if (!story) {
          // throw new BadRequestException('Story not found');

          return {
            message: `Story with id ${elementId} not found`
          }

        }


        // Si la historia ya esta en la lista no la agregamos
        if (playListFromDb.stories.map(story => story.toString()).includes(elementId)) {
          //throw new BadRequestException('Story already exists in the playlist');

          return {
            message: `Story with id ${elementId} already exists in the playlist`,
          }
        }

        playListFromDb.stories.push(story._id);
        await playListFromDb.save();
      }



      // Si el tipo de lista es palabra
      if (playListType === 'Word') {
        const word = await this.wordModel.findOne({ _id: elementId });


        // Si la palabra ya esta en la lista no la agregamos
        if (playListFromDb.words.map(word => word.toString()).includes(elementId)) {
          //throw new BadRequestException('Word already exists in the playlist');

          return {
            message: `Word with id ${elementId} already exists in the playlist`,
          }
        }

        if (!word) {
          // throw new BadRequestException('Word not found');

          return {
            message: `Word with id ${elementId} not found`
          }
        }

        playListFromDb.words.push(word._id);
        await playListFromDb.save();

      }



      // Si el tipo de lista es frase
      if (playListType === 'Phrase') {

        const phrase = await this.phraseModel.findOne({ _id: elementId });

        if (!phrase) {
          //  throw new BadRequestException('Phrase not found');

          return {
            message: `Phrase with id ${elementId} not found`
          }

        }

        // Si la frase ya esta en la lista no la agregamos
        if (playListFromDb.phrases.map(phrase => phrase.toString()).includes(elementId)) {
          // throw new BadRequestException('Phrase already exists in the playlist');
          return {
            message: `Phrase with id ${elementId} already exists in the playlist`,
          }

        }

        playListFromDb.phrases.push(phrase._id);
        await playListFromDb.save();

      }

      return playListFromDb;

    } catch (error) {
      handleError(error);
    }


  }



  async addMultipleElementsToPlaylist(addElementToPlaylistDto: AddElementToPlaylistDto[], userId: string) {



    try {


      if (!addElementToPlaylistDto.length) {
        throw new BadRequestException('No elements provided to add to playlist');
      }



      // Creamos un array con las promesas de agregar elementos a la lista
      const promises = addElementToPlaylistDto.map((element) => {
        return this.addElementToPlaylist(element, userId)
      });
      // Esperamos que todas las promesas se resuelvan
      const result = await Promise.all(promises);

      return result;


    } catch (error) {
      handleError(error);
    }
  }

  async removeElementFromPlaylist(addElementToPlaylistDto: AddElementToPlaylistDto, userId: string) {


    try {

      const { playlistId, elementId } = addElementToPlaylistDto;

      const playListFromDb = await this.playListModel.findOne({ _id: playlistId });


      if (!playListFromDb) {
        throw new BadRequestException('Playlist not found');
      }


      if (playListFromDb.user.toString() !== userId.toString() && !playListFromDb.editorUsers.map(user => user.toString()).includes(userId.toString())) {
        throw new BadRequestException('You are not allowed to remove elements from this playlist');
      }


      const playListType = playListFromDb.type;

      if (playListType === 'Story') {
        playListFromDb.stories = playListFromDb.stories.filter(story => story.toString() !== elementId);
        await playListFromDb.save();
      }


      if (playListType === 'Word') {
        playListFromDb.words = playListFromDb.words.filter(word => word.toString() !== elementId);
        await playListFromDb.save();
      }


      return playListFromDb;


    } catch (error) {
      handleError(error);
    }

  }



  async findOne(playlistId: string, userId: string, querys: any) {


    try {


      const { type, orden } = querys;



      this.validateElementType(type);
      this.validateOrden(orden);




      const playlist = await this.playListModel.findOne({
        _id: playlistId,
        type: type,
        $or: [
          { user: userId },
          { editorUsers: userId },
          { viewerUsers: userId }
        ]
      })
        .populate('editorUsers', 'fullName email id')
        .populate('viewerUsers', 'fullName email id')
        .populate('stories')
        .populate('words')
        .populate('phrases');




      if (!playlist) {
        throw new BadRequestException('Playlist not found');
      }


      if (type === 'Word') {

        return {
          playlist: await this.getWordsPlayListWithStats(playlist, userId, orden)
        }
      }


      if (type === 'Story') {
        return {
          playlist: await this.getStoryPlayListWithStats(playlist, userId, orden)
        }

      }

      if(type === 'Phrase' ) {
          
          return {
            playlist: playlist
          }
      }



      return {
        message: 'Not implemented yet'
      }






    } catch (error) {
      handleError(error);
    }


  }

  update(id: number, updatePlaylistDto: UpdatePlaylistDto) {
    return `This action updates a #${id} playlist`;
  }


  async getStoryPlayListWithStats(playlist: any, userId: string, orden: string) {


    const promiseStoryWithStats = playlist.stories.map(story => {
      return this.storyService.findOne(story._id, userId)
    });


    const storiesWithStats = (await Promise.all(promiseStoryWithStats)).map((storyStats => {

      console.log(storyStats);

      return {

        storyId: storyStats.story._id,
        title: storyStats.story.title,
        reproductions: storyStats.story.reproductions,
        paragraph: storyStats.story.paragraph,
        isFavorite: storyStats.story.isFavorite,
        listenDate: storyStats.story.listenDate,
      }
    }
    ));

    const newPlayList = playlist.toJSON();

    (newPlayList.stories as any) = storiesWithStats;

    if (orden === 'menos-reproducidas') {

      newPlayList.stories = newPlayList.stories.sort((a: any, b: any) => a.reproductions - b.reproductions);

    }

    if (orden === 'mas-reproducidas') {
      newPlayList.stories = newPlayList.stories.sort((a: any, b: any) => b.reproductions - a.reproductions);

    }

    if (orden === 'aleatorias') {
      newPlayList.stories = newPlayList.stories.sort(() => Math.random() - 0.5);
    }


    return newPlayList;


  }


  async getWordsPlayListWithStats(playlist: any, userId: string, orden: string) {



    const promiseWordsWithStats = playlist.words.map(word => {
      return this.wordStatsService.findWordStatByWordId(word._id, userId)
    });

    const wordsWithStats = (await Promise.all(promiseWordsWithStats)).map((wordStats => {

      console.log(wordStats);

      return {
        wordId: wordStats.wordStats.word._id,
        word: wordStats.wordStats.word.word,
        reproductions: wordStats.wordStats.reproductions,
        audio: wordStats.wordStats.word.audio,
        translation: wordStats.wordStats.word.translation,

      }
    }))

    const newPlayList = playlist.toJSON();




    (newPlayList.words as any) = wordsWithStats;


    if (orden === 'menos-reproducidas') {

      newPlayList.words = newPlayList.words.sort((a: any, b: any) => a.reproductions - b.reproductions);

    }


    if (orden === 'mas-reproducidas') {
      newPlayList.words = newPlayList.words.sort((a: any, b: any) => b.reproductions - a.reproductions);

    }

    if (orden === 'aleatorias') {
      newPlayList.words = newPlayList.words.sort(() => Math.random() - 0.5);
    }


    return newPlayList;

  }



  async remove(playListId: string, userId: string) {

    try {

      const playlist = await this.playListModel.findOne({ _id: playListId });


      // Verificamos si la lista existe
      if (!playlist) {
        throw new BadRequestException(`Playlist with id ${playListId} not found`);
      }

      // Verificamos si el usuario es el dueño de la lista
      if (playlist.toJSON().user.toString() !== userId.toString()) {
        throw new BadRequestException('You are not allowed to delete this playlist');
      }


      await this.playListModel.deleteOne({ _id: playListId });



      return {
        message: 'Playlist deleted successfully'
      };








    } catch (error) {
      handleError(error);
    }

  }


  validateOrden(orden: string) {

    if (!orden) {
      throw new BadRequestException('orden is required');
    }

    if (!this.validOrden.includes(orden)) {
      throw new BadRequestException(`orden not valid(${this.validOrden.join(', ')})`);
    }
  }


}
