import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // TODO: Implement compression middleware when dependencies are available
    // For now, just pass through
    next();
  }
}

@Injectable()
export class CacheHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Set appropriate cache headers based on route
    const url = req.originalUrl;
    
    // API data endpoints - short cache
    if (url.includes('/api/') && (url.includes('/properties') || url.includes('/leads'))) {
      res.set({
        'Cache-Control': 'private, max-age=60, must-revalidate',
        'ETag': `"${Date.now()}"`, // Simple ETag for demo
      });
    }
    
    // Static assets - long cache
    if (url.includes('/uploads/') || url.includes('/assets/')) {
      res.set({
        'Cache-Control': 'public, max-age=31536000, immutable',
      });
    }
    
    // Health checks - no cache
    if (url.includes('/health') || url.includes('/ping')) {
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
    }
    
    next();
  }
}

@Injectable()
export class PerformanceMonitoringMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    
    // Add request timing
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Log slow requests (> 1 second)
      if (duration > 1000) {
        console.warn(`Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`);
      }
      
      // Add performance headers in development
      if (process.env.NODE_ENV === 'development') {
        res.set('X-Response-Time', `${duration}ms`);
      }
    });
    
    next();
  }
}