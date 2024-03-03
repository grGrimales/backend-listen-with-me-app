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
    CategoryModule
  ],
  controllers: [AppController],
  providers: [AppService, CategoryService],
})
export class AppModule { }
