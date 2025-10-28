// Database schema using Drizzle ORM - referenced from blueprint:javascript_database
import { pgTable, serial, text, timestamp, uuid, date } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  nome: text("nome").notNull(),
  sobrenome: text("sobrenome").notNull(),
  cpf: text("cpf").notNull().unique(),
  telefone: text("telefone").notNull(),
  nascimento: date("nascimento").notNull(),
  api_token: text("api_token"),
  profile_image: text("profile_image"),
  preferences: text("preferences"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
