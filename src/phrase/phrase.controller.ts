/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PhraseService } from './phrase.service';
import { CreatePhraseDto } from './dto/create-phrase.dto';
import { UpdatePhraseDto } from './dto/update-phrase.dto';


import { JwtValidateGuard } from '../guard/jwt-validate/jwt-validate.guard';
import { ValidateMongoIdGuard } from '../guard/validate-mondo-id/validate-mondo-id.guard';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('phrase')
export class PhraseController {
  constructor(private readonly phraseService: PhraseService) {}



  @UseGuards(
    JwtValidateGuard,
  )
  @Post('create')
  create(@Body() createPhraseDto: CreatePhraseDto, @Req() request) {

    const userId = request.user.id;

    return this.phraseService.create(createPhraseDto, userId);
  }





  @UseGuards(
    JwtValidateGuard,
  )
  @Get('find-phrases')
  findMyPhrases(
    @Req() request

  ) {

    const userId = request.user.id;
    return this.phraseService.findMyPhrases(request.query,userId);
  }



  @UseGuards(
    JwtValidateGuard,
    ValidateMongoIdGuard,
  )
  @Get('find-my-phrases-by-story/:id')
  findMyPhrasesByStory(@Param('id') id: string, @Req() request){


    const userId = request.user.id;

    return this.phraseService.findMyPhrasesByStory(id, userId);
  }

  @UseGuards(
    ValidateMongoIdGuard,
    JwtValidateGuard
  )
  @Patch('update-audio/:id')
  @UseInterceptors(FileInterceptor('file'))
  updateAudio(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.phraseService.updateAudio(id, file);
  }




  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phraseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhraseDto: UpdatePhraseDto) {
    return this.phraseService.update(+id, updatePhraseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phraseService.remove(+id);
  }
}
