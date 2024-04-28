/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { WordStatsService } from './word-stats.service';
import { CreateWordStatDto } from './dto/create-word-stat.dto';
import { UpdateWordStatDto } from './dto/update-word-stat.dto';
import { JwtValidateGuard } from '../guard/jwt-validate/jwt-validate.guard';
import { ValidateMongoIdGuard } from '../guard/validate-mondo-id/validate-mondo-id.guard';



@Controller('word-stats')
export class WordStatsController {
  constructor(private readonly wordStatsService: WordStatsService) { }

  @Post()
  create(@Body() createWordStatDto: CreateWordStatDto) {
    return this.wordStatsService.create(createWordStatDto);
  }



  @UseGuards(
    JwtValidateGuard,
  )
  @Get()
  findAll(
    @Req() request
  ) {

    const userId = request.user.id;

    return this.wordStatsService.findAll(userId, request.query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wordStatsService.findOne(+id);
  }

  @Patch(':id')
  // eslint-disable-next-line prettier/prettier
  update(@Param('id') id: string, @Body() updateWordStatDto: UpdateWordStatDto) {
    return this.wordStatsService.update(+id, updateWordStatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wordStatsService.remove(+id);
  }


  @UseGuards(
    JwtValidateGuard,
    ValidateMongoIdGuard
  )
  @Patch('increment-reproductions/:id')
  incrementReproductions(
    @Param('id') id: string,
    @Req() request

  ) {
    const userId = request.user.id;
    const type_reproductions = request.query.type_reproductions;
    return this.wordStatsService.incrementReproductions(id, userId, type_reproductions);
  }



  @UseGuards(
    JwtValidateGuard,
    ValidateMongoIdGuard
  )
  @Patch('add-word-to-category/:id')
  addWordToCategory(
    @Param('id') id: string,
    @Req() request,
    @Body() body
  ) {
    const categorys = body.categorys;
    const userId =  request.user.id;
    return this.wordStatsService.addWordToCategory(id, categorys, userId);
  }




  @UseGuards(
    JwtValidateGuard,
    ValidateMongoIdGuard
  )
  @Get('find-word-stat-by-word-id/:id')
  findWordStatByWordId(
    @Param('id') id: string,
    @Req() request

  ) {
    const userId = request.user.id;


    return this.wordStatsService.findWordStatByWordId(id, userId);
  }
}
