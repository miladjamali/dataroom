import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { users, UserRole } from "@dataroom/models";
import {
  jwtMiddleware,
  requireAdmin,
  requireModerator,
  requireMinimumRole,
} from "../middleware.js";
import type { CustomContextVariables } from "@dataroom/types";

const adminRoutes = new Hono<{ Variables: CustomContextVariables }>();

// Admin-only routes
adminRoutes.use("/admin/*", jwtMiddleware, requireAdmin);

// Get all users with full details (admin only)
adminRoutes.get("/admin/users", async (c) => {
  try {
    const allUsers = await db.select().from(users);

    return c.json({
      message: "All users retrieved (admin access)",
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update user role (admin only)
adminRoutes.put("/admin/users/:id/role", async (c) => {
  try {
    const targetUserId = c.req.param("id");
    const body = await c.req.json();
    const { role } = body;

    if (!role || !Object.values(UserRole).includes(role)) {
      return c.json(
        {
          error: "Invalid role",
          validRoles: Object.values(UserRole),
        },
        400
      );
    }

    const updatedUser = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, targetUserId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        updatedAt: users.updatedAt,
      });

    if (updatedUser.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      message: "User role updated successfully",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Update role error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Moderator-only routes
adminRoutes.use("/moderation/*", jwtMiddleware, requireModerator);

// Moderation dashboard
adminRoutes.get("/moderation/dashboard", async (c) => {
  const userRole = c.get("userRole") as string;

  return c.json({
    message: "Moderation dashboard access granted",
    userRole,
    availableActions: [
      "View reports",
      "Moderate content",
      "Manage user warnings",
    ],
  });
});

// Hierarchical role example - requires minimum moderator level
adminRoutes.use(
  "/management/*",
  jwtMiddleware,
  requireMinimumRole("moderator")
);

// Management statistics
adminRoutes.get("/management/stats", async (c) => {
  const userRole = c.get("userRole") as string;

  try {
    const userStats = await db
      .select({
        role: users.role,
        count: users.id,
      })
      .from(users);

    // Simple count by role (in real app, use SQL COUNT)
    const roleStats = userStats.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return c.json({
      message: "Management statistics",
      userRole,
      statistics: {
        totalUsers: userStats.length,
        roleDistribution: roleStats,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { adminRoutes };
