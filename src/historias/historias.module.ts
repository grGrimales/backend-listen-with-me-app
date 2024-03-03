import { Module } from '@nestjs/common';
import { HistoriasService } from './historias.service';
import { HistoriasController } from './historias.controller';

@Module({
  controllers: [HistoriasController],
  providers: [HistoriasService],
})
export class HistoriasModule {}
