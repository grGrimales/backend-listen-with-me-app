/* eslint-disable prettier/prettier */
import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AddMultipleElementToPlaylistDto {

    @IsNotEmpty()
    @IsMongoId()
    playlistId: string;


    @IsNotEmpty()
    @IsArray({
        message: 'elementId must be an array of strings'
    })
    @IsMongoId({ each: true })
    elementId: string;




}