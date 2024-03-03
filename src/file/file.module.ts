import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { UserModule } from '../user/user.module';
import { UserSchema } from '../user/entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [FileController],
  providers: [FileService],
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema}]),
  ],

  exports: [FileService]
})
export class FileModule {}
