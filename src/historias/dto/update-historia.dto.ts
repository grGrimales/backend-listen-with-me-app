import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoriaDto } from './create-historia.dto';

export class UpdateHistoriaDto extends PartialType(CreateHistoriaDto) {}
