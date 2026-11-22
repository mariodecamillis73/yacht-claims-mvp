import type { PrismaClient } from '@prisma/client';
export function normalizeYes(input: unknown): {digest:string; yachts:unknown[]; claims:unknown[]; raw:unknown};
export function previewYes(db:PrismaClient,p:ReturnType<typeof normalizeYes>):Promise<{digest:string;yachts:number;claims:number;comments:number;completed:boolean;collisions:unknown[];yachtCorrections:unknown[]}>;
export function applyYes(db:PrismaClient,p:ReturnType<typeof normalizeYes>,actorId:string,options:{databaseUrl?:string;backupPath?:string}):Promise<unknown>;
