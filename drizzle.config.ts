import { defineConfig } from "drizzle-kit";

// Configuração opcional - só será usada se DATABASE_URL estiver definida
export default defineConfig({
  out: "./drizzle",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/temp",
  },
});
