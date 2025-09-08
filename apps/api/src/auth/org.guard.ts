import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class OrgGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // שלב 1: כרגע נשתמש ב־header. בהמשך אפשר לעבור ל-JWT.
    const headerOrg = req.headers['x-org-id'] as string | undefined;

    // אם אין header, אפשר לשים דיפולט "demo" (ל-dev) או לזרוק 401.
    const ownerUid = headerOrg?.trim() || 'demo';

    if (!ownerUid) {
      throw new UnauthorizedException('Missing organization / owner id');
    }

    // נשמור אותו על הבקשה כדי שהקונטרולר/שירותים יקראו ממנו.
    req.ownerUid = ownerUid;
    return true;
  }
}

// טיפוס עזר ל-TS: אפשר להוסיף קובץ דקלרציה קטן אם את רוצה:
// apps/api/src/types/express.d.ts
// declare global { namespace Express { interface Request { ownerUid?: string } } }
