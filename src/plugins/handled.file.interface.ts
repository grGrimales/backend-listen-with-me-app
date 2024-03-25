/* eslint-disable prettier/prettier */
export abstract class HandledFileInterface {

  public abstract deleteFile(publicId: string, cloudinaryConfig: any,temporalPath: string): Promise<true>;

  public abstract uploadFile(
    file:  Express.Multer.File,
    cloudinaryConfig: any,
    validExtensions: string[],
    temporalPath: string
    ): Promise<true>;



}