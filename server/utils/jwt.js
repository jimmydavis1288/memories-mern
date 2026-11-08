import { SignJWT, jwtVerify } from 'jose';

const secret = process.env.JWT_SECRET;

if (!secret || Buffer.byteLength(secret) < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 bytes before starting the API.');
}

const key = new TextEncoder().encode(secret);
const issuer = 'memories-api';
const audience = 'memories-client';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const createSessionToken = async (userId) => new SignJWT({})
  .setProtectedHeader({ alg: 'HS256' })
  .setSubject(userId)
  .setIssuer(issuer)
  .setAudience(audience)
  .setIssuedAt()
  .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
  .sign(key);

export const verifySessionToken = async (token) => {
  const { payload } = await jwtVerify(token, key, { issuer, audience, algorithms: ['HS256'] });

  if (!payload.sub) {
    throw new Error('Session token has no subject.');
  }

  return payload.sub;
};
