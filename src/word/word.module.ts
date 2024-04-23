/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { WordService } from './word.service';
import { WordController } from './word.controller';
import { UserSchema } from '../user/entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { WordSchema } from './entities/word.entity';
import { WordStatSchema } from '../word-stats/entities/word-stat.entity';
import { WordStatsService } from '../word-stats/word-stats.service';
import { CloudinaryAdapter } from '../plugins/cloudinary.adapter';


@Module({
  controllers: [WordController],
  providers: [WordService,WordStatsService,CloudinaryAdapter],
  imports: [
    MongooseModule.forFeature([{ name: 'Word', schema: WordSchema}]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema}]),
    MongooseModule.forFeature([{ name: 'WordStat', schema: WordStatSchema}]),
  ]

})

export class WordModule {}
