/* eslint-disable prettier/prettier */
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { ParagraphSchema } from "../entities/story.entity";

export class CreateStoryDto {

    @IsString()
    title: string;


    @IsString()
    date: string;

    @IsArray()
    @ArrayMinSize(1)
    categories: string[];

    @IsBoolean()
    isFavorite: boolean;


    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ParagraphDto)
    paragraph: ParagraphDto[];

    @IsString({
        message: 'level is required'
    })
    level: string;




}

class ParagraphDto {

    id_paragraph: string;

    @IsString()
    text: string;

    @IsString()
    translation: string;

    @IsString({
        message: 'img is required'
    })
    @MinLength(1)
    img: string;

    @IsString({
        message: 'audio is required'
    })
    @MinLength(1)
    audio: string;


}
