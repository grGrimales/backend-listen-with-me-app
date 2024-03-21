import { Test, TestingModule } from '@nestjs/testing';
import { WordStatsController } from './word-stats.controller';
import { WordStatsService } from './word-stats.service';

describe('WordStatsController', () => {
  let controller: WordStatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordStatsController],
      providers: [WordStatsService],
    }).compile();

    controller = module.get<WordStatsController>(WordStatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
