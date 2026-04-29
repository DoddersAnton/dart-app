import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({
    path: '.env.local',
})

console.log(process.env.DATABASE_URL);

export default defineConfig({
  schema: './server/schema.ts',
  out: './server/migrations',
  dialect: 'postgresql',
  //driver: 'pg',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})