import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema: './src/db/schema.js',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url:
            process.env.DATABASE_URL ||
            'postgres://estatev2:estatev2@localhost:5432/estatev2',
    },
    verbose: true,
    strict: true,
})
