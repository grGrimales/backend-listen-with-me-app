/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { HandledFileInterface } from "./handled.file.interface";
import toStream = require('buffer-to-stream');
import { handleError } from "../helpers/handled-error";
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryAdapter implements HandledFileInterface {



    async deleteFile(
        fileUrl: string,
        cloudinaryConfig: any,
        temporalPath: string): Promise<true> {

        try {


            if (!fileUrl) throw new BadRequestException('File url is required');

            const publicId =  fileUrl.split('/').pop().split('.').shift();
            
            console.log('public_id', temporalPath + '/' + publicId);

            // eliminar cloudainaty by url file
            const result = await cloudinaryConfig.uploader.destroy(temporalPath + '/' + publicId, {
                resource_type: 'video',
            })
            return result;

        } catch (error) {

            handleError(error);
        }

    }



    async uploadFile(
        file: Express.Multer.File,
        cloudinaryConfig: any,
        validExtensions: string[],
        temporalPath: string
    ): Promise<any> {

        // Subir archivo a Cloudinary
        try {


            if (!file) throw new BadRequestException('file is required');


            const fileExtension = file.originalname.split('.').pop();
            if (!validExtensions.includes(fileExtension)) throw new BadRequestException(`Invalid file extension, valid extensions are ${validExtensions.join(', ')}`);


            const fileCloudinary = new Promise((resolve, reject) => {
                const upload = cloudinaryConfig.uploader.upload_stream({
                    resource_type: 'auto',
                    folder: temporalPath,


                }, (error, result) => {
                    if (error) return reject(error);

                    resolve(result);
                },

                );

                toStream(file.buffer).pipe(upload)

            });

            const upload = await fileCloudinary;

    
            const { secure_url, public_id } = upload as UploadApiResponse;
            console.log('public_id', public_id);
            return {
                secure_url,
                public_id
            };

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