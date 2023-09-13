import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        console.log('🍓', error.message)
        const errorMsg = error.message ? error.message : '请求错误'; 
        throw new HttpException({ success: false, msg: errorMsg }, 200);
      }),
      map(data => ({
        data,
        success: true,
        msg: '',
      })),
    );
  }
}
 