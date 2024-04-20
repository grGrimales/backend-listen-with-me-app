/* eslint-disable prettier/prettier */

import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsMongoId, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";




export class CreatePlaylistDto {



    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['Story', 'Word'])
    type: string;


    //     editorUsers: { type: [Schema.Types.ObjectId], ref: 'User', required: false },

    @IsArray()
    @IsMongoId({ each: true })
    editorUsers: string[];



    //    viewerUsers: { type: [Schema.Types.ObjectId], ref: 'User', required: false },
    
    @IsArray()
    @IsMongoId({ each: true })
    viewerUsers: string[];

    //    stories: { type: [Schema.Types.ObjectId], ref: 'Story', required: false },


    @IsArray()
    @IsMongoId({ each: true })
    stories: string[];


    //    words: { type: [Schema.Types.ObjectId], ref: 'Word', required: false },

    @IsArray()
    @IsMongoId({ each: true })
    words: string[];




}

