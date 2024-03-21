import { Test, TestingModule } from '@nestjs/testing';
import { WordStatsService } from './word-stats.service';

describe('WordStatsService', () => {
  let service: WordStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WordStatsService],
    }).compile();

    service = module.get<WordStatsService>(WordStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
