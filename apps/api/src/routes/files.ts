import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { jwtMiddleware } from "../middleware.js";
import { db } from "../db.js";
import { files } from "@dataroom/models";
import type { CustomContextVariables } from "@dataroom/types";

const fileRoutes = new Hono<{ Variables: CustomContextVariables }>();

// All file routes require authentication
fileRoutes.use("*", jwtMiddleware);

// Upload file endpoint
fileRoutes.post("/upload", async (c) => {
  try {
    const userId = c.get("userId") as string;
    const formData = await c.req.formData();

    const file = formData.get("file") as File;
    const isPublic = formData.get("isPublic") === "true";
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const { FileService } = await import("../fileService.js");

    const options = {
      isPublic,
      description: description || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()) : undefined,
      folderId: folderId || undefined,
    };

    const result = await FileService.uploadFile(userId, file, options);

    return c.json(
      {
        message: "File uploaded successfully",
        file: result,
      },
      201
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return c.json(
      {
        error: error.message || "Failed to upload file",
      },
      400
    );
  }
});

// Get user's files
fileRoutes.get("/my-files", async (c) => {
  try {
    const userId = c.get("userId") as string;
    const { FileService } = await import("../fileService.js");

    const userFiles = await FileService.getUserFiles(userId);

    // Format the response
    const formattedFiles = userFiles.map((file) => ({
      ...file,
      isPublic: file.isPublic === 1,
      tags: file.tags ? JSON.parse(file.tags) : [],
      formattedSize: FileService.formatFileSize(file.size),
    }));

    return c.json({
      message: "Files retrieved successfully",
      files: formattedFiles,
      count: formattedFiles.length,
    });
  } catch (error) {
    console.error("Get files error:", error);
    return c.json({ error: "Failed to retrieve files" }, 500);
  }
});

// Get specific file by ID
fileRoutes.get("/file/:id", async (c) => {
  try {
    const fileId = c.req.param("id");
    const userId = c.get("userId") as string;
    const { FileService } = await import("../fileService.js");

    const file = await FileService.getFileById(fileId, userId);

    if (!file) {
      return c.json({ error: "File not found or access denied" }, 404);
    }

    return c.json({
      message: "File retrieved successfully",
      file: {
        ...file,
        isPublic: file.isPublic === 1,
        tags: file.tags ? JSON.parse(file.tags) : [],
        formattedSize: FileService.formatFileSize(file.size),
      },
    });
  } catch (error) {
    console.error("Get file error:", error);
    return c.json({ error: "Failed to retrieve file" }, 500);
  }
});

// Update file metadata
fileRoutes.put("/file/:id", async (c) => {
  try {
    const fileId = c.req.param("id");
    const userId = c.get("userId") as string;
    const body = await c.req.json();

    const { description, tags, isPublic } = body;
    const { FileService } = await import("../fileService.js");

    const updatedFile = await FileService.updateFileMetadata(fileId, userId, {
      description,
      tags,
      isPublic,
    });

    if (!updatedFile) {
      return c.json({ error: "File not found or access denied" }, 404);
    }

    return c.json({
      message: "File updated successfully",
      file: {
        ...updatedFile,
        isPublic: updatedFile.isPublic === 1,
        tags: updatedFile.tags ? JSON.parse(updatedFile.tags) : [],
      },
    });
  } catch (error) {
    console.error("Update file error:", error);
    return c.json({ error: "Failed to update file" }, 500);
  }
});

// Delete file
fileRoutes.delete("/file/:id", async (c) => {
  try {
    const fileId = c.req.param("id");
    const userId = c.get("userId") as string;
    const { FileService } = await import("../fileService.js");

    const deleted = await FileService.deleteFile(fileId, userId);

    if (!deleted) {
      return c.json({ error: "File not found or access denied" }, 404);
    }

    return c.json({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    return c.json({ error: "Failed to delete file" }, 500);
  }
});

// Public file access endpoint (for public files)
fileRoutes.get("/public/:id", async (c) => {
  try {
    const fileId = c.req.param("id");
    const { FileService } = await import("../fileService.js");

    const file = await FileService.getFileById(fileId);

    if (!file || !file.isPublic) {
      return c.json({ error: "File not found or not public" }, 404);
    }

    // Redirect to blob URL
    return c.redirect(file.blobUrl);
  } catch (error) {
    console.error("Public file access error:", error);
    return c.json({ error: "Failed to access file" }, 500);
  }
});

// Move file to a different folder
fileRoutes.patch("/:id/move", jwtMiddleware, async (c) => {
  try {
    const userId = c.get("userId") as string;
    const fileId = c.req.param("id");
    const { folderId } = await c.req.json();

    // Validate that the file exists and belongs to the user
    const existingFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .limit(1);

    if (existingFiles.length === 0) {
      return c.json({ error: "File not found or access denied" }, 404);
    }

    // If folderId is provided, validate that the folder exists and belongs to the user
    if (folderId && folderId !== null) {
      const { folders } = await import("@dataroom/models");
      const existingFolders = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
        .limit(1);

      if (existingFolders.length === 0) {
        return c.json(
          { error: "Target folder not found or access denied" },
          404
        );
      }
    }

    // Update the file's folder
    const updated = await db
      .update(files)
      .set({ folderId: folderId || null })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    if (updated.length === 0) {
      return c.json({ error: "Failed to move file" }, 500);
    }

    return c.json({
      message: "File moved successfully",
      file: updated[0],
    });
  } catch (error) {
    console.error("Move file error:", error);
    return c.json({ error: "Failed to move file" }, 500);
  }
});

export { fileRoutes };
