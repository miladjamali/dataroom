import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db.js'
import { users } from '@dataroom/models'
import { jwtMiddleware } from '../middleware.js'
import type { CustomContextVariables } from '@dataroom/types'

const userRoutes = new Hono<{ Variables: CustomContextVariables }>()

// Protected Routes - require JWT authentication
userRoutes.use('/profile/*', jwtMiddleware) // Apply JWT middleware to all /profile routes
userRoutes.use('/update', jwtMiddleware)    // Apply JWT middleware to update route

// Get user profile
userRoutes.get('/profile', async (c) => {
  try {
    const userId = c.get('userId') as string // Get userId from JWT middleware
    
    const userData = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      age: users.age,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.id, userId))

    if (userData.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      message: 'Profile retrieved successfully',
      user: userData[0]
    })

  } catch (error) {
    console.error('Profile error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update user profile
userRoutes.put('/update', async (c) => {
  try {
    const userId = c.get('userId') as string // Get userId from JWT middleware
    const body = await c.req.json()
    const { name, age } = body

    if (!name && age === undefined) {
      return c.json({ error: 'At least one field (name or age) is required' }, 400)
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (age !== undefined) updateData.age = age
    updateData.updatedAt = new Date()

    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        age: users.age,
        role: users.role,
        updatedAt: users.updatedAt,
      })

    if (updatedUser.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      message: 'Profile updated successfully',
      user: updatedUser[0]
    })

  } catch (error) {
    console.error('Update error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get all users (public endpoint)
userRoutes.get('/', async (c) => {  
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      age: users.age,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users)

    return c.json({
      message: 'Users retrieved successfully',
      users: allUsers,
      count: allUsers.length
    })

  } catch (error) {
    console.error('List users error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get user by ID (public endpoint)
userRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const userData = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      age: users.age,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, id))

    if (userData.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      message: 'User retrieved successfully',
      user: userData[0]
    })

  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export { userRoutes }