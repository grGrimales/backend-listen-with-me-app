import { PartialType } from '@nestjs/mapped-types';
import { CreatePhraseDto } from './create-phrase.dto';

export class UpdatePhraseDto extends PartialType(CreatePhraseDto) {}
