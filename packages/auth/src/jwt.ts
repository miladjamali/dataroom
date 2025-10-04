import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export type TokenOptions = jwt.SignOptions;

/**
 * Generate a JWT token (simple version for API compatibility)
 * @param userId - User ID
 * @param role - User role
 * @returns string - JWT token
 */
export const generateToken = (userId: string, role: string): string => {
  const JWT_SECRET = process.env.JWTSecretKey || 'default-secret';
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Generate a JWT token (flexible version)
 * @param payload - Token payload containing user information
 * @param secret - JWT secret key
 * @param options - Token options (expiry, issuer, etc.)
 * @returns string - JWT token
 */
export const generateTokenWithPayload = (
  payload: Omit<TokenPayload, 'iat' | 'exp'>, 
  secret: string,
  options: TokenOptions = {}
): string => {
  const defaultOptions: TokenOptions = {
    expiresIn: '24h',
    ...options
  };
  
  return jwt.sign(payload, secret, defaultOptions);
};

/**
 * Verify and decode a JWT token (simple version for API compatibility)
 * @param token - JWT token to verify
 * @returns Object with userId and role or null if invalid
 */
export const verifyToken = (token: string): { userId: string; role: string } | null => {
  try {
    const JWT_SECRET = process.env.JWTSecretKey || 'default-secret';
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch (error) {
    return null;
  }
};

/**
 * Verify and decode a JWT token (flexible version)
 * @param token - JWT token to verify
 * @param secret - JWT secret key
 * @returns TokenPayload | null - Decoded token payload or null if invalid
 */
export const verifyTokenWithSecret = (token: string, secret: string): TokenPayload | null => {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Decode a JWT token without verification (for client-side use)
 * @param token - JWT token to decode
 * @returns TokenPayload | null - Decoded token payload or null if invalid format
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Check if a token is expired (without verification)
 * @param token - JWT token to check
 * @returns boolean - True if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  return Date.now() >= decoded.exp * 1000;
};

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns string | null - Extracted token or null
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};