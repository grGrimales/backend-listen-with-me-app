/* eslint-disable prettier/prettier */

import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsMongoId, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";



export class CreatePhraseDto {


    @IsString()
    phrase: string;

    @IsString()
    translation: string;


    @IsOptional()
    @IsString()
    img: string;


    @IsOptional()
    @IsString()
    audio: string;


    @IsOptional()
    @IsString()
    level: string;


    @IsOptional()
    @IsArray()
    @ArrayMinSize(1, { message: 'If categories is present, it must have at least one element' })
    categories: string[];

    @IsOptional()
    date: string;

    @IsOptional()
    @IsMongoId()
    originStory: string;




    /*
        phrase: { type: String, required: true, unique: true},
    translation: { type: String, required: true },
    img: { type: String, required: false },
    audio: { type: String, required: false },
    level: { type: String, required: false },
    categories: { type: [String], required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true, default: Date.now()},
    originStory: { type: Schema.Types.ObjectId, ref: 'Story', required: false }
    */
}

