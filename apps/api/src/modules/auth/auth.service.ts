import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

@Injectable()
export class AuthService {
  sign(user: any) {
    return jwt.sign(user, SECRET, { expiresIn: '1h' });
  }
  verify(token: string) {
    try { return jwt.verify(token, SECRET); }
    catch { return null; }
  }
}
