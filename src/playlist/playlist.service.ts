/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { handleError } from '../helpers/handled-error';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story } from '../story/entities/story.entity';
import { PlayList } from './entities/playlist.entity';
import e from 'express';
import { AddElementToPlaylistDto } from './dto/add-element-to-playlist-dto';


@Injectable()
export class PlaylistService {

  constructor(
    @InjectModel('Story') private readonly storyModel: Model<Story>,
    @InjectModel('PlayList') private readonly playListModel: Model<PlayList>,
  ) { }


  async create(createPlaylistDto: CreatePlaylistDto, userId: string) {



    try {


      const playlistExist = await this.playListModel.findOne({ title: createPlaylistDto.title, user: userId });

      console.log('playlistExist', playlistExist);

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

  async findAllMyPlaylists(userId: string) {



    try {


      const playlists = await this.playListModel.find({ user: userId })
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
    if (elementType !== 'story' && elementType !== 'word') {
      throw new BadRequestException('Invalid element type provided to add to playlist should be story or word');
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



      if (playListType === 'Story') {
        const story = await this.storyModel.findOne({ _id: elementId });

        if (!story) {
          throw new BadRequestException('Story not found');
        }


        // Si la historia ya esta en la lista no la agregamos
        if (playListFromDb.stories.map(story => story.toString()).includes(elementId)) {
          throw new BadRequestException('Story already exists in the playlist');
        }

        playListFromDb.stories.push(story._id);
        await playListFromDb.save();
      } else if (playListType === 'Word') {
        const word = await this.storyModel.findOne({ _id: elementId });


        // Si la palabra ya esta en la lista no la agregamos
        if (playListFromDb.words.map(word => word.toString()).includes(elementId)) {
          throw new BadRequestException('Word already exists in the playlist');
        }

        if (!word) {
          throw new BadRequestException('Word not found');
        }

        playListFromDb.words.push(word._id);
        await playListFromDb.save();

      }

      return playListFromDb;

    } catch (error) {
      handleError(error);
    }


  }


  findAll() {
    return `This action returns all playlist`;
  }

  async findOne(playlistId: string, userId: string) {


    try {

      const playlist = await this.playListModel.findOne({
        _id: playlistId,
        $or: [
          { user: userId },
          { editorUsers: userId },
          { viewerUsers: userId }
        ]
      })
        .populate('editorUsers', 'fullName email id')
        .populate('viewerUsers', 'fullName email id')
        .populate('stories')
        .populate('words');

      if (!playlist) {
        throw new BadRequestException('Playlist not found');
      }

      return playlist;



    } catch (error) {
      handleError(error);
    }


  }

  update(id: number, updatePlaylistDto: UpdatePlaylistDto) {
    return `This action updates a #${id} playlist`;
  }

  async remove(playListId: string, userId: string) {

    try {

      const playlist = await this.playListModel.findOne({ _id: playListId});


      // Verificamos si la lista existe
      if(!playlist){
        throw new BadRequestException( `Playlist with id ${playListId} not found`);
      }

      // Verificamos si el usuario es el dueño de la lista
      if(playlist.toJSON().user.toString() !== userId.toString()){
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
}
