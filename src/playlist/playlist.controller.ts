/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';


// Guard

import { JwtValidateGuard } from '../guard/jwt-validate/jwt-validate.guard';
import { AddElementToPlaylistDto } from './dto/add-element-to-playlist-dto';
import { ValidateMongoIdGuard } from '../guard/validate-mondo-id/validate-mondo-id.guard';



@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}


  @UseGuards(
    JwtValidateGuard,
  )
  @Post('create')
  create(@Body() createPlaylistDto: CreatePlaylistDto, @Req() request  ) {

    const userId = request.user.id;


    return this.playlistService.create(createPlaylistDto, userId);
  }



  @UseGuards(
    JwtValidateGuard,
  )
  @Put('add-element-to-playlist')
  addElementToPlaylist(@Body() addElementToPlaylistDto: AddElementToPlaylistDto, @Req() request) {
    const userId = request.user.id;

    // playlistId: string, elementId: string, elementType: string, userId: string
    return this.playlistService.addElementToPlaylist(addElementToPlaylistDto, userId);
  }


  @UseGuards(
    JwtValidateGuard,
  )
  @Put('remove-element-to-playlist')
  removeElementToPlaylist(@Body() addElementToPlaylistDto: AddElementToPlaylistDto, @Req() request) {
    const userId = request.user.id;

    // playlistId: string, elementId: string, elementType: string, userId: string
    return this.playlistService.removeElementFromPlaylist(addElementToPlaylistDto, userId);
  }


  
  @UseGuards(
    JwtValidateGuard,
  )
  @Get('my-playlists')
  findAllMyPlayList(
    @Req() request
  ) {

    const userId = request.user.id;
const query = request.query;

    return this.playlistService.findAllMyPlaylists(userId, query);
  }

  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard,
  )
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request) {

    const userId = request.user.id;

    const query = request.query;

    return this.playlistService.findOne(id, userId, query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaylistDto: UpdatePlaylistDto) {
    return this.playlistService.update(+id, updatePlaylistDto);
  }

  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard,
  )
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request) {

    const userId = request.user.id;

    return this.playlistService.remove(id, userId);
  }



  @UseGuards(
    JwtValidateGuard,
  )
  @Put('add-multiple-elements-to-playlist')
  addMultipleElementsToPlaylist(@Body() addElementToPlaylistDto: AddElementToPlaylistDto[], @Req() request){
    const userId = request.user.id;

    return this.playlistService.addMultipleElementsToPlaylist(addElementToPlaylistDto, userId);
  }
}
