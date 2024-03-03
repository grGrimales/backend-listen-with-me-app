import { AdminValidateGuard } from './admin-validate.guard';

describe('AdminValidateGuard', () => {
  it('should be defined', () => {
    expect(new AdminValidateGuard()).toBeDefined();
  });
});
