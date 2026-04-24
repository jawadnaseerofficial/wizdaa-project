import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

describe('TransformInterceptor', () => {
  it('wraps response data in a success envelope', async () => {
    const interceptor = new TransformInterceptor();
    const context = {} as ExecutionContext;
    const handler: CallHandler = {
      handle: () => of({ value: 123 }),
    } as any;

    const result = await lastValueFrom(interceptor.intercept(context, handler));

    expect(result).toEqual({
      success: true,
      data: { value: 123 },
    });
  });
});
