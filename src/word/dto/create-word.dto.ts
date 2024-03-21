import { IsString } from "class-validator";

export class CreateWordDto {


    @IsString(
        {
            message: 'word is required'
        }
    )
    word: string;

    @IsString(
        {
            message: 'translation is required'
        }
    )

    translation: string;
    img: string;
    audio: string;
    level: string;
    phrases: string[];

}
