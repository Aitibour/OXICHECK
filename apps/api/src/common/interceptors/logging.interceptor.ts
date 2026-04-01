import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Request, Response } from 'express';

interface RequestUser {
  id?: string;
  organizationId?: string;
}

interface StructuredLog {
  /** ISO-8601 timestamp */
  timestamp: string;
  /** HTTP verb */
  method: string;
  /** Full request URL including query string */
  url: string;
  /** Authenticated user ID, or "anonymous" */
  userId: string;
  /** Tenant / organization ID, or "none" */
  organizationId: string;
  /** HTTP response status code */
  statusCode: number;
  /** Wall-clock duration in milliseconds */
  durationMs: number;
  /** Whether the request completed successfully */
  success: boolean;
  /** Error message if the request failed */
  error?: string;
}

/**
 * Logging interceptor — emits one structured JSON log line per request.
 *
 * Format is compatible with Azure Monitor / Application Insights structured
 * logging ingestion.  Each log entry is a flat JSON object so that Azure Log
 * Analytics can parse individual fields without a custom parser.
 *
 * Example output:
 * {
 *   "timestamp": "2026-03-31T12:00:00.000Z",
 *   "method": "POST",
 *   "url": "/api/reservations",
 *   "userId": "usr_abc123",
 *   "organizationId": "org_xyz",
 *   "statusCode": 201,
 *   "durationMs": 42,
 *   "success": true
 * }
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { user?: RequestUser; organizationId?: string }>();
    const startTime = Date.now();

    const method = req.method;
    const url = req.url;
    const userId = req.user?.id ?? 'anonymous';
    const organizationId = req.organizationId ?? req.user?.organizationId ?? 'none';

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        const entry: StructuredLog = {
          timestamp: new Date().toISOString(),
          method,
          url,
          userId,
          organizationId,
          statusCode: res.statusCode,
          durationMs: Date.now() - startTime,
          success: res.statusCode < 400,
        };
        this.logger.log(JSON.stringify(entry));
      }),
      catchError((err: unknown) => {
        const statusCode =
          (err as { status?: number })?.status ??
          (err as { statusCode?: number })?.statusCode ??
          500;

        const entry: StructuredLog = {
          timestamp: new Date().toISOString(),
          method,
          url,
          userId,
          organizationId,
          statusCode,
          durationMs: Date.now() - startTime,
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
        this.logger.error(JSON.stringify(entry));
        return throwError(() => err);
      }),
    );
  }
}
