/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { WordStatsService } from './word-stats.service';
import { WordStatsController } from './word-stats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../user/entities/user.entity';
import { WordSchema } from '../word/entities/word.entity';
import { WordStatSchema } from './entities/word-stat.entity';

@Module({
  
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema}]),
    MongooseModule.forFeature([{ name: 'Word', schema: WordSchema}]),
    MongooseModule.forFeature([{ name: 'WordStat', schema: WordStatSchema}]),

  ],
  controllers: [WordStatsController],
  providers: [WordStatsService],

})
export class WordStatsModule {}
