import { z } from 'zod'

// Utility function to validate form data with Zod schema
export function validateWithZod(schema: any) {
  return (values: unknown) => {
    try {
      schema.parse(values)
      return {}
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errors[issue.path.join('.')] = issue.message
          }
        })
        return errors
      }
      return {}
    }
  }
}