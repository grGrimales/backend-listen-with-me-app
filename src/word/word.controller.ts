/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { WordService } from './word.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';

import { JwtValidateGuard } from '../guard/jwt-validate/jwt-validate.guard';
import { ValidateMongoIdGuard } from '../guard/validate-mondo-id/validate-mondo-id.guard';
import { AdminValidateGuard } from '../guard/admin-validate/admin-validate.guard';


@Controller('word')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  
  @UseGuards(
    JwtValidateGuard,
  )
  @Post()
  create(@Body() createWordDto: CreateWordDto, @Req() request) {
    const userId = request.user.id;
    return this.wordService.create(createWordDto, userId );
  }

  @Get()
  findAll() {
    return this.wordService.findAll();
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
