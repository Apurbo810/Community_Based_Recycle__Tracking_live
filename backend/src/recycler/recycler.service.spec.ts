import { Test, TestingModule } from '@nestjs/testing';
import { RecyclerController } from './recycler.controller';
import { RecyclerService } from './recycler.service';

describe('RecyclerController', () => {
  let controller: RecyclerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecyclerController],
    })
      .useMocker((token) => {
        if (token === RecyclerService) {
          return {}; // Provide an empty mock object for RecyclerService
        }
      })
      .compile();

    controller = module.get<RecyclerController>(RecyclerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
