/* eslint-disable prettier/prettier */

import {  IsArray,  IsIn, IsMongoId, IsNotEmpty,  IsString } from "class-validator";




export class CreatePlaylistDto {



    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['Story', 'Word', 'Phrase'])
    type: string;


    @IsArray()
    @IsMongoId({ each: true })
    editorUsers: string[];


    @IsArray()
    @IsMongoId({ each: true })
    viewerUsers: string[];

    @IsArray()
    @IsMongoId({ each: true })
    stories: string[];

    @IsArray()
    @IsMongoId({ each: true })
    words: string[];


}

