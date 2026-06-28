import { Test, TestingModule } from '@nestjs/testing';
import { Mt5Controller } from './mt5.controller';

describe('Mt5Controller', () => {
  let controller: Mt5Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Mt5Controller],
    }).compile();

    controller = module.get<Mt5Controller>(Mt5Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
