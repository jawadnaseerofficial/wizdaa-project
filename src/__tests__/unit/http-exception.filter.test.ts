import { ArgumentsHost, HttpException } from '@nestjs/common';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let response: any;
  let request: any;
  let host: ArgumentsHost;

  beforeEach(() => {
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    request = { url: '/test' };
    host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as any;
    filter = new HttpExceptionFilter();
  });

  it('formats HttpException responses correctly', () => {
    const exception = new HttpException('Not Found', 404);
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 404,
      path: '/test',
      message: 'Not Found',
    });
  });

  it('formats generic errors as internal server error', () => {
    const exception = new Error('Unexpected');
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 500,
      path: '/test',
      message: 'Internal server error',
    });
  });
});
