import { Hono } from "hono";
import { eq, and, isNull, ne, sql } from "drizzle-orm";
import { jwtMiddleware } from "../middleware.js";
import { db } from "../db.js";
import { folders, files } from "@dataroom/models";
import type { CustomContextVariables } from "@dataroom/types";

const folderRoutes = new Hono<{ Variables: CustomContextVariables }>();

// All folder routes require authentication
folderRoutes.use("*", jwtMiddleware);

// Get user's folders (root level by default, or children of specified parent)
folderRoutes.get("/", async (c) => {
  try {
    const userId = c.get("userId") as string;
    const parentId = c.req.query("parentId"); // Optional parent folder ID

    const whereCondition = parentId
      ? and(eq(folders.userId, userId), eq(folders.parentId, parentId))
      : and(eq(folders.userId, userId), isNull(folders.parentId));

    const userFolders = await db
      .select()
      .from(folders)
      .where(whereCondition)
      .orderBy(folders.name);

    return c.json({
      message: "Folders retrieved successfully",
      folders: userFolders,
    });
  } catch (error: any) {
    console.error("Get folders error:", error);
    return c.json({ error: "Failed to retrieve folders" }, 500);
  }
});

// Get root folder contents (files and folders not in any folder)
folderRoutes.get("/root/contents", async (c) => {
  try {
    const userId = c.get("userId") as string;

    // Get root level folders with file counts
    const rootFolders = await db
      .select({
        id: folders.id,
        name: folders.name,
        parentId: folders.parentId,
        userId: folders.userId,
        createdAt: folders.createdAt,
        updatedAt: folders.updatedAt,
        fileCount: sql<number>`(SELECT COUNT(*) FROM ${files} WHERE ${files.folderId} = ${folders.id} AND ${files.userId} = ${userId})`,
      })
      .from(folders)
      .where(and(eq(folders.userId, userId), isNull(folders.parentId)))
      .orderBy(folders.name);

    // Get root level files (not in any folder)
    const rootFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), isNull(files.folderId)))
      .orderBy(files.originalName);

    return c.json({
      message: "Root contents retrieved successfully",
      currentFolder: null,
      folders: rootFolders,
      files: rootFiles,
      breadcrumbs: [],
    });
  } catch (error: any) {
    console.error("Get root contents error:", error);
    return c.json({ error: "Failed to retrieve root contents" }, 500);
  }
});

// Move folder to different parent (must come before /:id/contents for route matching)
folderRoutes.patch("/:id/move", jwtMiddleware, async (c) => {
  try {
    const userId = c.get("userId") as string;
    const folderId = c.req.param("id");
    const { parentId } = await c.req.json();

    // Verify folder exists and belongs to user
    const existingFolders = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .limit(1);

    if (existingFolders.length === 0) {
      return c.json({ error: "Folder not found or access denied" }, 404);
    }

    // If parentId is provided, validate that the parent folder exists and belongs to the user
    if (parentId && parentId !== null) {
      const existingParentFolders = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, parentId), eq(folders.userId, userId)))
        .limit(1);

      if (existingParentFolders.length === 0) {
        return c.json(
          { error: "Target parent folder not found or access denied" },
          404
        );
      }

      // Prevent moving folder into itself or its descendants
      if (await isDescendantOf(parentId, folderId, userId)) {
        return c.json(
          { error: "Cannot move folder into itself or its descendant" },
          400
        );
      }
    }

    // Update the folder's parent
    const updated = await db
      .update(folders)
      .set({ parentId: parentId || null })
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .returning();

    if (updated.length === 0) {
      return c.json({ error: "Failed to move folder" }, 500);
    }

    return c.json({
      message: "Folder moved successfully",
      folder: updated[0],
    });
  } catch (error) {
    console.error("Move folder error:", error);
    return c.json({ error: "Failed to move folder" }, 500);
  }
});

// Get folder contents (subfolders and files)
folderRoutes.get("/:id/contents", async (c) => {
  try {
    const userId = c.get("userId") as string;
    const folderId = c.req.param("id");

    // Handle root case
    if (folderId === "root") {
      return c.json(
        { error: "Use /folders/root/contents for root folder" },
        400
      );
    }

    // Verify folder exists and belongs to user
    const folder = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .limit(1);

    if (folder.length === 0) {
      return c.json({ error: "Folder not found" }, 404);
    }

    // Get subfolders with file counts
    const subfolders = await db
      .select({
        id: folders.id,
        name: folders.name,
        parentId: folders.parentId,
        userId: folders.userId,
        createdAt: folders.createdAt,
        updatedAt: folders.updatedAt,
        fileCount: sql<number>`(SELECT COUNT(*) FROM ${files} WHERE ${files.folderId} = ${folders.id} AND ${files.userId} = ${userId})`,
      })
      .from(folders)
      .where(and(eq(folders.userId, userId), eq(folders.parentId, folderId)))
      .orderBy(folders.name);

    // Get files in folder
    const folderFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.folderId, folderId)))
      .orderBy(files.originalName);

    // Build breadcrumbs
    const breadcrumbs = await buildBreadcrumbs(folderId, userId);

    return c.json({
      message: "Folder contents retrieved successfully",
      currentFolder: folder[0],
      folders: subfolders,
      files: folderFiles,
      breadcrumbs,
    });
  } catch (error: any) {
    console.error("Get folder contents error:", error);
    return c.json({ error: "Failed to retrieve folder contents" }, 500);
  }
});

// Create a new folder
folderRoutes.post("/", async (c) => {
  try {
    const userId = c.get("userId") as string;
    const { name, parentId, description } = await c.req.json();

    if (!name || typeof name !== "string" || name.trim() === "") {
      return c.json({ error: "Folder name is required" }, 400);
    }

    // Validate parent folder exists and belongs to user if provided
    if (parentId) {
      const parentFolder = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, parentId), eq(folders.userId, userId)))
        .limit(1);

      if (parentFolder.length === 0) {
        return c.json({ error: "Parent folder not found" }, 404);
      }
    }

    // Check if folder with same name already exists in the same location
    const whereCondition = parentId
      ? and(
          eq(folders.userId, userId),
          eq(folders.parentId, parentId),
          eq(folders.name, name.trim())
        )
      : and(
          eq(folders.userId, userId),
          isNull(folders.parentId),
          eq(folders.name, name.trim())
        );

    const existingFolder = await db
      .select()
      .from(folders)
      .where(whereCondition)
      .limit(1);

    if (existingFolder.length > 0) {
      return c.json(
        { error: "A folder with this name already exists in this location" },
        409
      );
    }

    // Create folder
    const newFolder = await db
      .insert(folders)
      .values({
        userId,
        name: name.trim(),
        parentId: parentId || null,
      })
      .returning();

    return c.json({
      message: "Folder created successfully",
      folder: newFolder[0],
    });
  } catch (error: any) {
    console.error("Create folder error:", error);
    return c.json({ error: "Failed to create folder" }, 500);
  }
});

// Update folder (rename)
folderRoutes.put("/:id", async (c) => {
  try {
    const userId = c.get("userId") as string;
    const folderId = c.req.param("id");
    const { name } = await c.req.json();

    if (!name || typeof name !== "string" || name.trim() === "") {
      return c.json({ error: "Folder name is required" }, 400);
    }

    // Verify folder exists and belongs to user
    const folder = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .limit(1);

    if (folder.length === 0) {
      return c.json({ error: "Folder not found" }, 404);
    }

    // Check if folder with same name already exists in the same location
    const whereCondition = folder[0].parentId
      ? and(
          eq(folders.userId, userId),
          eq(folders.parentId, folder[0].parentId),
          eq(folders.name, name.trim()),
          // Exclude current folder from check
          ne(folders.id, folderId)
        )
      : and(
          eq(folders.userId, userId),
          isNull(folders.parentId),
          eq(folders.name, name.trim()),
          // Exclude current folder from check
          ne(folders.id, folderId)
        );

    const existingFolder = await db
      .select()
      .from(folders)
      .where(whereCondition)
      .limit(1);

    if (existingFolder.length > 0) {
      return c.json(
        { error: "A folder with this name already exists in this location" },
        409
      );
    }

    // Update folder
    const updatedFolder = await db
      .update(folders)
      .set({
        name: name.trim(),
        updatedAt: new Date(),
      })
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .returning();

    return c.json({
      message: "Folder updated successfully",
      folder: updatedFolder[0],
    });
  } catch (error: any) {
    console.error("Update folder error:", error);
    return c.json({ error: "Failed to update folder" }, 500);
  }
});

// Delete folder
folderRoutes.delete("/:id", async (c) => {
  try {
    const userId = c.get("userId") as string;
    const folderId = c.req.param("id");

    // Verify folder exists and belongs to user
    const folder = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
      .limit(1);

    if (folder.length === 0) {
      return c.json({ error: "Folder not found" }, 404);
    }

    // Check if folder has contents (subfolders or files)
    const subfolders = await db
      .select()
      .from(folders)
      .where(eq(folders.parentId, folderId))
      .limit(1);

    const folderFiles = await db
      .select()
      .from(files)
      .where(eq(files.folderId, folderId))
      .limit(1);

    if (subfolders.length > 0 || folderFiles.length > 0) {
      return c.json(
        {
          error:
            "Cannot delete folder with contents. Please move or delete all contents first.",
        },
        409
      );
    }

    // Delete folder
    await db
      .delete(folders)
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)));

    return c.json({
      message: "Folder deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete folder error:", error);
    return c.json({ error: "Failed to delete folder" }, 500);
  }
});

// Helper function to check if targetId is a descendant of sourceId
async function isDescendantOf(
  targetId: string,
  sourceId: string,
  userId: string
): Promise<boolean> {
  if (targetId === sourceId) return true;

  const children = await db
    .select()
    .from(folders)
    .where(and(eq(folders.parentId, targetId), eq(folders.userId, userId)));

  for (const child of children) {
    if (await isDescendantOf(child.id, sourceId, userId)) {
      return true;
    }
  }

  return false;
}

// Helper function to build breadcrumbs
async function buildBreadcrumbs(
  folderId: string,
  userId: string
): Promise<Array<{ id: string; name: string; path: string }>> {
  const breadcrumbs: Array<{ id: string; name: string; path: string }> = [];
  let currentFolderId: string | null = folderId;

  while (currentFolderId) {
    const folder = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, currentFolderId), eq(folders.userId, userId)))
      .limit(1);

    if (folder.length === 0) break;

    breadcrumbs.unshift({
      id: folder[0].id,
      name: folder[0].name,
      path: `/${folder[0].name}`, // Simplified path for now
    });

    currentFolderId = folder[0].parentId;
  }

  return breadcrumbs;
}

export default folderRoutes;
