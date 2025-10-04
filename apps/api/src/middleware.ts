import type { Context, Next } from "hono";
import { verifyToken } from "@dataroom/auth/jwt";
import type { CustomContextVariables } from "@dataroom/types";

// CORS Middleware
export const corsMiddleware = async (c: Context, next: Next) => {
  // Handle preflight requests
  if (c.req.method === "OPTIONS") {
    c.header("Access-Control-Allow-Origin", "*");
    c.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    c.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    c.header("Access-Control-Max-Age", "86400"); // 24 hours
    return c.text("", 200);
  }

  // Set CORS headers for all requests
  c.header("Access-Control-Allow-Origin", "*");
  c.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  c.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  await next();
};

// JWT Authentication Middleware
export const jwtMiddleware = async (c: Context, next: Next) => {
  const authorization = c.req.header("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return c.json(
      {
        error: "Unauthorized",
        message: "Authorization header with Bearer token is required",
      },
      401
    );
  }

  const token = authorization.substring(7); // Remove 'Bearer ' prefix
  const decoded = verifyToken(token);

  if (!decoded) {
    return c.json(
      {
        error: "Invalid token",
        message: "The provided token is invalid or expired",
      },
      401
    );
  }

  // Add user info to context for use in protected routes
  c.set("userId", decoded.userId);
  c.set("userRole", decoded.role);
  await next();
};

// Role-based Authorization Middleware
export const requireRole = (allowedRoles: string | string[]) => {
  return async (c: Context, next: Next) => {
    const userRole = c.get("userRole") as string;

    if (!userRole) {
      return c.json(
        {
          error: "Forbidden",
          message: "User role not found in token",
        },
        403
      );
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      return c.json(
        {
          error: "Forbidden",
          message: `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${userRole}`,
        },
        403
      );
    }

    await next();
  };
};

// Admin-only middleware (shorthand)
export const requireAdmin = requireRole(["admin", "super_admin"]);

// Super admin-only middleware (shorthand)
export const requireSuperAdmin = requireRole("super_admin");

// Moderator or higher middleware (shorthand)
export const requireModerator = requireRole([
  "moderator",
  "admin",
  "super_admin",
]);

// Role hierarchy check middleware
export const requireMinimumRole = (minimumRole: string) => {
  const roleHierarchy = {
    user: 0,
    moderator: 1,
    admin: 2,
    super_admin: 3,
  };

  return async (c: Context, next: Next) => {
    const userRole = c.get("userRole") as string;

    if (!userRole) {
      return c.json(
        {
          error: "Forbidden",
          message: "User role not found in token",
        },
        403
      );
    }

    const userLevel =
      roleHierarchy[userRole as keyof typeof roleHierarchy] ?? -1;
    const requiredLevel =
      roleHierarchy[minimumRole as keyof typeof roleHierarchy] ?? 999;

    if (userLevel < requiredLevel) {
      return c.json(
        {
          error: "Forbidden",
          message: `Access denied. Minimum required role: ${minimumRole}. Your role: ${userRole}`,
        },
        403
      );
    }

    await next();
  };
};

// Optional: Middleware to check if user exists in database
export const userExistsMiddleware = async (c: Context, next: Next) => {
  const userId = c.get("userId");

  if (!userId) {
    return c.json({ error: "User ID not found in context" }, 500);
  }

  // You can add database check here if needed
  // const userExists = await db.select().from(users).where(eq(users.id, userId));
  // if (userExists.length === 0) {
  //   return c.json({ error: 'User not found' }, 404);
  // }

  await next();
};
