import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const DB_PATH = path.resolve('/tmp/mvp-users.json');

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  industries: string[];
}

@Injectable()
export class UsersService {
  async loadAll(): Promise<User[]> {
    try { return JSON.parse(await fs.readFile(DB_PATH, 'utf8')); }
    catch { return []; }
  }
  async saveAll(users: User[]) {
    await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2));
  }

  async findByEmail(email: string) {
    const all = await this.loadAll();
    return all.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async create(email: string, password: string, industries: string[]) {
    const all = await this.loadAll();
    if (all.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('exists');
    }
    const id = Math.random().toString(36).slice(2, 10);
    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = { id, email, passwordHash, industries };
    all.push(user);
    await this.saveAll(all);
    return { id, email, industries };
  }

  async verify(email: string, password: string) {
    const u = await this.findByEmail(email);
    if (!u) return null;
    const ok = await bcrypt.compare(password, u.passwordHash);
    return ok ? { id: u.id, email: u.email, industries: u.industries } : null;
  }
}
