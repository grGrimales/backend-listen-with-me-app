/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';

import { MongooseModule } from '@nestjs/mongoose';

import { StorySchema } from './../story/entities/story.entity';
import { UserSchema } from '../user/entities/user.entity';
import { WordSchema } from '../word/entities/word.entity';
import { PlayListSchema } from './entities/playlist.entity';
import { PhraseSchema } from '../phrase/entities/phrase.entity';


import { WordStatSchema } from '../word-stats/entities/word-stat.entity';


@Module({
  controllers: [PlaylistController],
  providers: [PlaylistService],
  imports : [
    MongooseModule.forFeature([{ name: 'Story', schema: StorySchema}]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema}]),
    MongooseModule.forFeature([{ name: 'Word', schema: WordSchema}]),
    MongooseModule.forFeature([{ name: 'Phrase', schema: PhraseSchema}]),
    MongooseModule.forFeature([{ name: 'PlayList', schema: PlayListSchema  }]),
    MongooseModule.forFeature([{ name: 'WordStat', schema: WordStatSchema}]),


  
  ],
})
export class PlaylistModule {}
