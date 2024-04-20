/* eslint-disable prettier/prettier */
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AddElementToPlaylistDto {


    
    @IsNotEmpty()
    @IsMongoId()
    playlistId: string;


    @IsNotEmpty()
    @IsMongoId()
    elementId: string;
}




