"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const { PrismaClient } = require('@prisma/client');
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new PrismaClient({});
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
//# sourceMappingURL=client.js.map