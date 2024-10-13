/* eslint-disable prettier/prettier */


import { Module } from '@nestjs/common';
import { PhraseService } from './phrase.service';
import { PhraseController } from './phrase.controller';
import { CloudinaryAdapter } from '../plugins/cloudinary.adapter';


import { MongooseModule } from '@nestjs/mongoose';


import { StorySchema } from './../story/entities/story.entity';
import { UserSchema } from '../user/entities/user.entity';
import { WordSchema } from '../word/entities/word.entity';
import { PhraseSchema } from './entities/phrase.entity';
import { PlayListSchema } from 'src/playlist/entities/playlist.entity';


@Module({
  controllers: [PhraseController],
  providers: [PhraseService,CloudinaryAdapter],

  imports : [
    MongooseModule.forFeature([{ name: 'Story', schema: StorySchema}]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema}]),
    MongooseModule.forFeature([{ name: 'Word', schema: WordSchema}]),
    MongooseModule.forFeature([{ name: 'Phrase', schema: PhraseSchema}]),

    MongooseModule.forFeature([{ name: 'PlayList', schema: PlayListSchema}]),


  
  ],
})
export class PhraseModule {}
