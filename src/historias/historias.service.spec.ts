import { Test, TestingModule } from '@nestjs/testing';
import { HistoriasService } from './historias.service';

describe('HistoriasService', () => {
  let service: HistoriasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoriasService],
    }).compile();

    service = module.get<HistoriasService>(HistoriasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
