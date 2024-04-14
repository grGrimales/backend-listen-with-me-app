/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { JwtValidateGuard } from '../guard/jwt-validate/jwt-validate.guard';
import { AdminValidateGuard } from '../guard/admin-validate/admin-validate.guard';
import { ValidateMongoIdGuard } from '../guard/validate-mondo-id/validate-mondo-id.guard';



@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) { }

  @UseGuards(
    JwtValidateGuard,
    AdminValidateGuard
  )
  @Post()
  create(@Body() createStoryDto: CreateStoryDto, @Req() request) {
    const userId = request.user.id;
    return this.storyService.create(createStoryDto, userId);
  }


  @UseGuards(
    JwtValidateGuard,
   // AdminValidateGuard
  )
  @Post("restart")
  createDataDummy() {
    return this.storyService.restarStory();
  }

  @UseGuards(JwtValidateGuard)
  @Get("filtros")
  findAllByFiltros(@Req() request) {

    const querys = request.query;
    const userId = request.user.id;
    return this.storyService.findAllByFiltros(userId, querys);
  }


  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard,
  )
  @Get('story-by-id/:id')
  findOne(@Param('id') id: string, @Req() request) {
    const userId = request.user.id;
    return this.storyService.findOne(id, userId);
  }

  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard,
  )
  @Get('story-by-id-with-word-information/:id')
  findOneWithWordInformation(@Param('id') id: string, @Req() request) {
    const userId = request.user.id;
    return this.storyService.findOneWithWordInformation(id, userId);
  }


  @UseGuards(
    JwtValidateGuard,
  )
  @Get('by-user')
  findAllByUser(@Req() request) {

    const userId = request.user.id;

    return this.storyService.findAllByUser(userId, request.query);
  }

  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard,
    AdminValidateGuard
  )
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoryDto: UpdateStoryDto) {

    return this.storyService.update(id, updateStoryDto);
  }


  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard,
    AdminValidateGuard
  )
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storyService.remove(id);
  }


  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard,
  )
  @Patch('incrementar-reproduccion/:id')
  incremtarReproduccion(@Param('id') id: string, @Req() request) {

    const tipo = request.query.tipo_reproduccion
    const userId = request.user.id;
    return this.storyService.incremtarReproduccion(id, userId, tipo);
  }


  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard,
  )
  @Patch('update-favorite/:id')
  updateFavorite(@Param('id') id: string, @Req() request) {

    const userId = request.user.id;

    return this.storyService.updateFavorite(id, userId);

  }

  @UseGuards(
    JwtValidateGuard,
  )
  @Get()
  findAll(@Req() request) {
    const userId = request.user.id;

    return this.storyService.findAll(userId)
  }

  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard
  )
  @Patch('add-owner-story-by-user/:id')
  addOwnerStoryByUser(
    @Param('id') storyId: string,
    @Req() request) {
    const userId = request.user.id;
    return this.storyService.addOwnerStoryByUser( storyId, userId);
  }


}
