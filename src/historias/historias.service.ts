import { Injectable } from '@nestjs/common';
import { CreateHistoriaDto } from './dto/create-historia.dto';
import { UpdateHistoriaDto } from './dto/update-historia.dto';

@Injectable()
export class HistoriasService {
  create(createHistoriaDto: CreateHistoriaDto) {
    return 'This action adds a new historia';
  }

  findAll() {
    return `This action returns all historias`;
  }

  findOne(id: number) {
    return `This action returns a #${id} historia`;
  }

  update(id: number, updateHistoriaDto: UpdateHistoriaDto) {
    return `This action updates a #${id} historia`;
  }

  remove(id: number) {
    return `This action removes a #${id} historia`;
  }
}
