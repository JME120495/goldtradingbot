import { Test, TestingModule } from '@nestjs/testing';
import { Mt5Service } from './mt5.service';

describe('Mt5Service', () => {
  let service: Mt5Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Mt5Service],
    }).compile();

    service = module.get<Mt5Service>(Mt5Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
