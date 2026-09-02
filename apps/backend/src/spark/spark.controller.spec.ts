import { Test, TestingModule } from '@nestjs/testing';
import { SparkController } from './spark.controller';

describe('SparkController', () => {
  let controller: SparkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SparkController],
    }).compile();

    controller = module.get<SparkController>(SparkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
