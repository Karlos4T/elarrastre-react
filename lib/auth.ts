import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

export type AdminSession = {
  sub: string;
  iat: number;
  exp: number;
};

export class AdminUnauthorizedError extends Error {
  constructor() {
    super("Admin session missing");
    this.name = "AdminUnauthorizedError";
  }
}

function ensureConfig() {
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SECRET;

  if (!username || !password) {
    throw new Error("ADMIN_USER y ADMIN_PASSWORD deben estar configurados.");
  }

  if (!secret) {
    throw new Error("ADMIN_SECRET debe estar configurado.");
  }

  return { username, password, secret };
}

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  let output = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = 4 - (output.length % 4);
  if (pad !== 4) {
    output += "=".repeat(pad);
  }
  return Buffer.from(output, "base64");
}

function signPayload(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest();
}

function createToken(payload: AdminSession, secret: string) {
  const payloadEncoded = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const signature = base64UrlEncode(signPayload(payloadEncoded, secret));
  return `${payloadEncoded}.${signature}`;
}

function verifyToken(token: string, secret: string): AdminSession | null {
  const [payloadEncoded, signatureEncoded] = token.split(".");
  if (!payloadEncoded || !signatureEncoded) {
    return null;
  }

  const expectedSignature = signPayload(payloadEncoded, secret);
  const providedSignature = base64UrlDecode(signatureEncoded);

  if (
    providedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const payloadBuffer = base64UrlDecode(payloadEncoded);
    const payload = JSON.parse(payloadBuffer.toString("utf8")) as AdminSession;
    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch (error) {
    console.error("Error parsing admin session token", error);
    return null;
  }
}

export function validateAdminCredentials(username: string, password: string) {
  const config = ensureConfig();
  return username === config.username && password === config.password;
}

export function createAdminSession(username: string) {
  const { secret } = ensureConfig();
  const now = Date.now();
  return createToken({ sub: username, iat: now, exp: now + SESSION_TTL_MS }, secret);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const { secret } = ensureConfig();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifyToken(token, secret);
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new AdminUnauthorizedError();
  }
  return session;
}

export function attachAdminSessionCookie(
  response: Response | import("next/server").NextResponse,
  username: string
) {
  const token = createAdminSession(username);
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const secureFlag = process.env.NODE_ENV === "production" ? "Secure; " : "";
  const cookieValue = `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; ${secureFlag}`.trim();
  response.headers.append("Set-Cookie", cookieValue);
}

export function clearAdminSessionCookie(
  response: Response | import("next/server").NextResponse
) {
  const secureFlag = process.env.NODE_ENV === "production" ? "Secure; " : "";
  const cookieValue = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${secureFlag}`.trim();
  response.headers.append("Set-Cookie", cookieValue);
}
