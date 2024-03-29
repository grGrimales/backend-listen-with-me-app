/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoriasModule } from './historias/historias.module';
import { UserModule } from './user/user.module';
import { StatsModule } from './stats/stats.module';
import { StoryModule } from './story/story.module';
import { FileModule } from './file/file.module';
import { CategoryService } from './category/category.service';
import { CategoryModule } from './category/category.module';
import { WordModule } from './word/word.module';
import { WordStatsModule } from './word-stats/word-stats.module';

require('dotenv').config()



@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI, {
    }),
    HistoriasModule,
    UserModule,
    StoryModule,
    StatsModule,
    FileModule,
    CategoryModule,
    WordModule,
    WordStatsModule,
  ],
  controllers: [AppController],
  providers: [AppService, CategoryService],
})
export class AppModule { }
