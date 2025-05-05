import * as schema from '@/server/schema';


import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';


const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);
export const db = drizzle({ client: sql, schema:schema, logger: true });