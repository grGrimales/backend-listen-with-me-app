import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
// Require the cloudinary library
import { handleError } from '../helpers/handled-error';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import toStream = require('buffer-to-stream');
import { resolve } from 'path';

@Injectable()
export class FileService {


  audioExtensions = ['mp3'];
  imageExtensions = ['png', 'jpg', 'jpeg'];

  constructor() {

    // Configurar Cloudinary

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  create(createFileDto: CreateFileDto) {
    return 'This action adds a new file';
  }

  findAll() {
    return `This action returns all file`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }

  async uploadTemporalFile(file: Express.Multer.File) {
    // Subir archivo a Cloudinary
    try {

      const fileExtension = file.originalname.split('.').pop();


      const validExtensions = [...this.audioExtensions, ...this.imageExtensions];

      if (!validExtensions.includes(fileExtension)) throw new BadRequestException(`Invalid file extension, valid extensions are ${validExtensions.join(', ')}`);

      const typeFile = this.audioExtensions.includes(fileExtension) ? 'audio' : 'image';


      const fileCloudinary = new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream({
          resource_type: 'auto',
          folder: 'temporal',


        }, (error, result) => {
          if (error) return reject(error);

          resolve(result);
        },

        );

        toStream(file.buffer).pipe(upload)

      });

      const upload = await fileCloudinary;
      const { secure_url, public_id } = upload as UploadApiResponse;
      return {
        temp_path: secure_url,
        public_id

      };

    } catch (error) {

      handleError(error);

    }

  }

  async deleteTemporalFile(id: string) {

    try {
      const result = await cloudinary.uploader.destroy(id);
      return result;
    } catch (error) {
      handleError(error);
    }

  }

  async deleteAllTemporalFiles() {
    try {
      const result = await cloudinary.api.delete_resources_by_prefix('test');

      return result;
    } catch (error) {
      handleError(error);
    }
  }

  async uploadPermanentFile(temporalPath: string, titleStory: string) {

    if (!temporalPath) return new BadRequestException('Temporal path is required');
    if (!titleStory) return new BadRequestException('Title story is required');

    const version = 'v1';
    const extension = temporalPath.split('.').pop();
    const validExtensions = [...this.audioExtensions, ...this.imageExtensions];

    if (!validExtensions.includes(extension)) throw new BadRequestException(`Invalid file extension, valid extensions are ${validExtensions.join(', ')}`);
    const typeFile = this.audioExtensions.includes(extension) ? 'audio' : 'image';
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const currentDay = new Date().getDate();
    const folder = `test/${version}/${currentYear}/${currentMonth}/${currentDay}/${titleStory}/${typeFile}`;


    try {
      const fileCloudinary = new Promise((resolve, reject) => {
        cloudinary.uploader.upload(temporalPath, {
          resource_type: 'auto',
          folder,

        }, (error, result) => {
          if (error) return reject(error);

          resolve(result);
        },

        );

      });

      const upload = await fileCloudinary;
      const { secure_url, public_id } = upload as UploadApiResponse;
      return {
        secure_url,
        public_id

      };

    } catch (error) {

      handleError(error);

    }

  }

  async deletePermanentFile(fileUrl: string) {

    try {

      console.log('fileUrl', fileUrl);

      if (!fileUrl) throw new BadRequestException('File url is required');


      const publicId = this.extractCloudinaryPublicId(fileUrl) ;

      // eliminar cloudainaty by url file
      const result  = await cloudinary.uploader.destroy(publicId)
      console.log('result', result);

    } catch (error) {

      handleError(error);
    }
  }


  extractCloudinaryPublicId(url: string): string | null {
    const regex = /upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
}



}
