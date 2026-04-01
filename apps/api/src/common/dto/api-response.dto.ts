import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ---------------------------------------------------------------------------
// Sub-types
// ---------------------------------------------------------------------------

export class ApiErrorDto {
  @ApiProperty({
    description: 'Machine-readable error code',
    example: 'RESERVATION_NOT_FOUND',
  })
  code!: string;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'The requested reservation could not be found.',
  })
  message!: string;
}

export class ApiMetaDto {
  @ApiPropertyOptional({ description: 'Current page (1-based)', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', example: 20 })
  limit?: number;

  @ApiPropertyOptional({ description: 'Total number of matching records', example: 142 })
  total?: number;
}

// ---------------------------------------------------------------------------
// Main response wrapper
// ---------------------------------------------------------------------------

/**
 * Standardized API response envelope used by all HotelCheckIn endpoints.
 *
 * @example Success (single resource)
 * {
 *   "success": true,
 *   "data": { "id": "res_123", ... }
 * }
 *
 * @example Success (paginated list)
 * {
 *   "success": true,
 *   "data": [...],
 *   "meta": { "page": 1, "limit": 20, "total": 142 }
 * }
 *
 * @example Error
 * {
 *   "success": false,
 *   "error": { "code": "NOT_FOUND", "message": "Resource not found" }
 * }
 */
export class ApiResponse<T> {
  @ApiProperty({ description: 'Whether the request succeeded', example: true })
  success!: boolean;

  @ApiPropertyOptional({ description: 'Response payload' })
  data?: T;

  @ApiPropertyOptional({ type: ApiErrorDto, description: 'Error details (present when success is false)' })
  error?: ApiErrorDto;

  @ApiPropertyOptional({ type: ApiMetaDto, description: 'Pagination metadata (present on list responses)' })
  meta?: ApiMetaDto;

  // ---------------------------------------------------------------------------
  // Static factory helpers
  // ---------------------------------------------------------------------------

  static ok<T>(data: T, meta?: ApiMetaDto): ApiResponse<T> {
    const res = new ApiResponse<T>();
    res.success = true;
    res.data = data;
    if (meta) res.meta = meta;
    return res;
  }

  static paginated<T>(
    data: T,
    page: number,
    limit: number,
    total: number,
  ): ApiResponse<T> {
    return ApiResponse.ok(data, { page, limit, total });
  }

  static fail<T = never>(code: string, message: string): ApiResponse<T> {
    const res = new ApiResponse<T>();
    res.success = false;
    res.error = { code, message };
    return res;
  }
}
