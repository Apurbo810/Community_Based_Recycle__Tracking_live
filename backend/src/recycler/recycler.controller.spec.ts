import { Test, TestingModule } from '@nestjs/testing';
import { RecyclerController } from './recycler.controller';
import { RecyclerService } from './recycler.service';

describe('RecyclerController', () => {
  let controller: RecyclerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecyclerController],
      providers: [
        {
          provide: RecyclerService,
          useValue: { // Mock methods if necessary
            someMethod: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecyclerController>(RecyclerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
