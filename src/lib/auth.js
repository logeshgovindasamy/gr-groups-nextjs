/**
 * JWT Authentication Utilities
 * Migrated from: Java Spring Security + JWT configuration
 * Uses jose library for edge-compatible JWT operations
 */

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970'
);

const JWT_EXPIRATION = process.env.JWT_EXPIRATION_MS
  ? parseInt(process.env.JWT_EXPIRATION_MS)
  : 86400000; // 24 hours

/**
 * Generate a JWT token for a user
 * @param {Object} payload - User data to encode
 * @returns {Promise<string>} JWT token
 */
export async function generateToken(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + JWT_EXPIRATION) / 1000))
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object|null>} Decoded payload or null
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
}

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a password with its hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} Whether passwords match
 */
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Extract token from Authorization header
 * @param {Request} request - Next.js request object
 * @returns {string|null} Token or null
 */
export function extractTokenFromHeader(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Authenticate a request and return the user payload
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object|null>} User payload or null
 */
export async function authenticateRequest(request) {
  const token = extractTokenFromHeader(request);
  if (!token) return null;
  return verifyToken(token);
}
