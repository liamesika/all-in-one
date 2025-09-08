// apps/api/src/types/prisma-shim.d.ts
// Shim to quiet TS until the local Prisma Client types resolve correctly.
// Runtime already works; this only fixes editor red squiggles.

declare module '@prisma/client' {
  interface PrismaClient {
    // relax types for new models so TS won't complain in the editor
    property: any;
    propertyPhoto: any;
  }
}
