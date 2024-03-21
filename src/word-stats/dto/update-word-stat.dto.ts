import { PartialType } from '@nestjs/mapped-types';
import { CreateWordStatDto } from './create-word-stat.dto';

export class UpdateWordStatDto extends PartialType(CreateWordStatDto) {}
