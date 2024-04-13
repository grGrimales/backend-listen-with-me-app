/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { WordService } from './word.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtValidateGuard } from '../guard/jwt-validate/jwt-validate.guard';
import { ValidateMongoIdGuard } from '../guard/validate-mondo-id/validate-mondo-id.guard';



@Controller('word')
export class WordController {
  constructor(private readonly wordService: WordService) { }


  @UseGuards(
    JwtValidateGuard,
  )
  @Post()
  create(@Body() createWordDto: CreateWordDto, @Req() request) {
    const userId = request.user.id;
    return this.wordService.create(createWordDto, userId);
  }

  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard
  )
  @Patch('audio/:id')
  @UseInterceptors(FileInterceptor('file'))
  updateAudio(
    @Param('id') wordId: string, @UploadedFile() file: Express.Multer.File,
  ) {


    return this.wordService.updateAudio(wordId, file);
  }

  @UseGuards(
    JwtValidateGuard
  )
  @Get()
  findAll(
    @Req() request
  ) {

    const userId = request.user.id;
    return this.wordService.findAll(request.query, userId);
  }

  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard
  )
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wordService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWordDto: UpdateWordDto) {
    return this.wordService.update(id, updateWordDto);
  }


  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard,
    // AdminValidateGuard !TODO: habilitar cuando se tenga el rol de admin
  )
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wordService.remove(id);
  }
}
