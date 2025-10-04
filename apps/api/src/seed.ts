import { users, files } from "@dataroom/models";

/**
 * Database seeding configuration
 * Can be customized per environment
 */
export const seedConfig = {
  users: {
    count: 20,
    roles: ['user', 'admin'] as const,
    defaultPassword: 'password123', // Will be hashed
  },
  files: {
    count: 50,
    mimeTypes: [
      'image/jpeg', 
      'image/png', 
      'application/pdf', 
      'text/plain',
      'application/json',
      'text/csv'
    ] as const,
  },
} as const;

/**
 * Generate random sample data
 */
function generateSampleUsers(count: number) {
  const roles = seedConfig.users.roles;
  const sampleUsers = [];
  
  for (let i = 0; i < count; i++) {
    sampleUsers.push({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: Math.floor(Math.random() * (80 - 18)) + 18,
      role: roles[Math.floor(Math.random() * roles.length)],
      password: seedConfig.users.defaultPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  return sampleUsers;
}

function generateSampleFiles(count: number, userIds: string[]) {
  const mimeTypes = seedConfig.files.mimeTypes;
  const sampleFiles = [];
  
  for (let i = 0; i < count; i++) {
    const mimeType = mimeTypes[Math.floor(Math.random() * mimeTypes.length)];
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    
    sampleFiles.push({
      filename: `file-${i + 1}.txt`,
      originalName: `Original File ${i + 1}`,
      mimeType,
      size: Math.floor(Math.random() * (10485760 - 1024)) + 1024, // 1KB to 10MB
      blobUrl: `https://example.com/file-${i + 1}`,
      blobPathname: `/uploads/file-${i + 1}`,
      isPublic: Math.random() > 0.5 ? 1 : 0, // Convert boolean to integer (0/1)
      description: `Description for file ${i + 1}`,
      tags: JSON.stringify(['tag1', 'tag2']), // Convert array to JSON string
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  return sampleFiles;
}

/**
 * Database seeding function that can be used from any app
 * @param db - Drizzle database instance
 * @param config - Optional seeding configuration override
 */
export async function seedDatabase(
  db: any, 
  config: Partial<typeof seedConfig> = {}
) {
  const finalConfig = { ...seedConfig, ...config };
  
  console.log("🌱 Starting database seeding...");
  console.log(`📊 Users: ${finalConfig.users.count}, Files: ${finalConfig.files.count}`);
  
  try {
    // Generate and insert users
    const sampleUsers = generateSampleUsers(finalConfig.users.count);
    const insertedUsers = await db.insert(users).values(sampleUsers).returning();
    const userIds = insertedUsers.map((user: any) => user.id);
    
    // Generate and insert files
    const sampleFiles = generateSampleFiles(finalConfig.files.count, userIds);
    await db.insert(files).values(sampleFiles);
    
    console.log("✅ Database seeding completed successfully!");
    console.log(`   👥 Created ${finalConfig.users.count} users`);
    console.log(`   📁 Created ${finalConfig.files.count} files`);
    
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  }
}

/**
 * Clear all data from database tables
 * @param db - Drizzle database instance
 */
export async function clearDatabase(db: any) {
  console.log("🧹 Clearing database...");
  
  try {
    // Delete in order to respect foreign key constraints
    await db.delete(files);
    await db.delete(users);
    
    console.log("✅ Database cleared successfully!");
  } catch (error) {
    console.error("❌ Database clearing failed:", error);
    throw error;
  }
}

/**
 * Reset database - clear and reseed
 * @param db - Drizzle database instance
 * @param config - Optional seeding configuration
 */
export async function resetDatabase(
  db: any, 
  config: Partial<typeof seedConfig> = {}
) {
  await clearDatabase(db);
  await seedDatabase(db, config);
}