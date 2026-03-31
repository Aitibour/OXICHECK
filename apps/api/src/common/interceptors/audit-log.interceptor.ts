import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

interface RequestUser {
  id?: string;
  organizationId?: string;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    const method = request.method;
    const url = request.url;
    const user = (request as Request & { user?: RequestUser }).user;
    const userId = user?.id ?? 'anonymous';
    const organizationId = user?.organizationId ?? 'none';

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode = response.statusCode;
        const responseTime = Date.now() - startTime;

        this.logger.log(
          JSON.stringify({
            method,
            url,
            userId,
            organizationId,
            statusCode,
            responseTimeMs: responseTime,
            timestamp: new Date().toISOString(),
          }),
        );
      }),
    );
  }
}
