import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { users, UserRole } from "@dataroom/models";
import { generateToken } from "@dataroom/auth/jwt";
import { hashPassword, comparePassword } from "@dataroom/auth/password";

import type { CustomContextVariables } from "@dataroom/types";

const auth = new Hono<{ Variables: CustomContextVariables }>();

// User signup
auth.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, age } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return c.json({ error: "Name, email, and password are required" }, 400);
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length > 0) {
      return c.json({ error: "User with this email already exists" }, 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        age: age || 0,
        role: UserRole.USER, // Default role for new users
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        age: users.age,
        role: users.role,
        createdAt: users.createdAt,
      });

    // Generate JWT token with role
    const token = generateToken(newUser[0].id, newUser[0].role);

    return c.json({
      message: "User created successfully",
      user: newUser[0],
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// User login
auth.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Find user by email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length === 0) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Verify password
    const isValidPassword = await comparePassword(
      password,
      existingUser[0].password
    );
    if (!isValidPassword) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Generate JWT token with role
    const token = generateToken(existingUser[0].id, existingUser[0].role);

    return c.json({
      message: "Login successful",
      user: {
        id: existingUser[0].id,
        name: existingUser[0].name,
        email: existingUser[0].email,
        age: existingUser[0].age,
        role: existingUser[0].role,
        createdAt: existingUser[0].createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { auth };
