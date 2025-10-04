import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Define user roles enum
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPER_ADMIN = 'super_admin'
}

// Users table schema
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default(UserRole.USER).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Folders table schema for organizing files
export const folders = pgTable("folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  parentId: uuid("parent_id").references((): any => folders.id, { onDelete: 'cascade' }), // Self-reference for nested folders
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Files table schema for storing file metadata
export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  folderId: uuid("folder_id").references(() => folders.id, { onDelete: 'set null' }), // Files can be in folders or root
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // Size in bytes
  blobUrl: text("blob_url").notNull(), // Vercel Blob URL
  blobPathname: text("blob_pathname").notNull(), // Blob pathname for deletion
  isPublic: integer("is_public").default(0).notNull(), // 0 = private, 1 = public
  description: text("description"),
  tags: text("tags"), // JSON string of tags
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Inferred types from database schemas
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertFolder = typeof folders.$inferInsert;
export type SelectFolder = typeof folders.$inferSelect;

export type InsertFile = typeof files.$inferInsert;
export type SelectFile = typeof files.$inferSelect;

// Additional utility types for the database
export type User = SelectUser;
export type NewUser = InsertUser;
export type Folder = SelectFolder;
export type NewFolder = InsertFolder;
export type File = SelectFile;
export type NewFile = InsertFile;

// Omit sensitive fields for public API responses
export type PublicUser = Omit<User, 'password'>;
export type FileMetadata = File;