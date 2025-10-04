// Validation constants
export const VALIDATION = {
  // User validation
  USER: {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 50
    },
    EMAIL: {
      MAX_LENGTH: 255
    },
    PASSWORD: {
      MIN_LENGTH: 8,
      MAX_LENGTH: 128
    },
    AGE: {
      MIN: 13,
      MAX: 120
    }
  },
  
  // File validation
  FILE: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 255
    },
    DESCRIPTION: {
      MAX_LENGTH: 500
    },
    TAGS: {
      MAX_COUNT: 10,
      MAX_TAG_LENGTH: 30
    }
  }
} as const;

// Regular expressions for validation
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: {
    // At least 8 characters, one uppercase, one lowercase, one number
    STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    // Basic: at least 8 characters
    BASIC: /^.{8,}$/
  },
  FILENAME: /^[^<>:"/\\|?*\x00-\x1f]+$/,
  TAG: /^[a-zA-Z0-9\s\-_]{1,30}$/
} as const;

// Validation error messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  
  USER: {
    NAME: {
      REQUIRED: 'Name is required',
      MIN_LENGTH: `Name must be at least ${VALIDATION.USER.NAME.MIN_LENGTH} characters`,
      MAX_LENGTH: `Name must be no more than ${VALIDATION.USER.NAME.MAX_LENGTH} characters`
    },
    EMAIL: {
      REQUIRED: 'Email is required',
      INVALID: 'Please enter a valid email address',
      MAX_LENGTH: `Email must be no more than ${VALIDATION.USER.EMAIL.MAX_LENGTH} characters`
    },
    PASSWORD: {
      REQUIRED: 'Password is required',
      MIN_LENGTH: `Password must be at least ${VALIDATION.USER.PASSWORD.MIN_LENGTH} characters`,
      MAX_LENGTH: `Password must be no more than ${VALIDATION.USER.PASSWORD.MAX_LENGTH} characters`,
      WEAK: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    },
    AGE: {
      REQUIRED: 'Age is required',
      MIN: `Age must be at least ${VALIDATION.USER.AGE.MIN}`,
      MAX: `Age must be no more than ${VALIDATION.USER.AGE.MAX}`,
      INVALID: 'Age must be a valid number'
    }
  },
  
  FILE: {
    REQUIRED: 'File is required',
    TOO_LARGE: `File size must be less than ${10}MB`,
    INVALID_TYPE: 'File type is not supported',
    NAME: {
      MAX_LENGTH: `Filename must be no more than ${VALIDATION.FILE.NAME.MAX_LENGTH} characters`,
      INVALID: 'Filename contains invalid characters'
    },
    DESCRIPTION: {
      MAX_LENGTH: `Description must be no more than ${VALIDATION.FILE.DESCRIPTION.MAX_LENGTH} characters`
    }
  }
} as const;