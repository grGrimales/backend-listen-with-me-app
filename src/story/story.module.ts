/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StorySchema } from './entities/story.entity';
import { UserSchema } from '../user/entities/user.entity';
import { StatSchema } from '../stats/entities/stat.entity';
import { FileService } from '../file/file.service';
import { CategoryService } from '../category/category.service';
import { WordStatSchema } from '../word-stats/entities/word-stat.entity';

@Module({
  controllers: [StoryController],
  imports : [
    MongooseModule.forFeature([{ name: 'Story', schema: StorySchema}]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema}]),
    MongooseModule.forFeature([{ name: 'Stats', schema: StatSchema}]),
    MongooseModule.forFeature([{ name: 'WordStat', schema: WordStatSchema}]),

  
  ],
  providers: [
    FileService,
    StoryService,
    CategoryService
  ],
  exports: [StoryService]
})
export class StoryModule {}


