// === Auth logic: register, login, JWT ===

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "../shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "evitamin-fallback-secret";
const JWT_EXPIRES_IN = "30d";
const BCRYPT_ROUNDS = 10;

export interface AuthPayload {
  userId: string;
  phone: string;
  role: string;
}

// Hash password sebelum disimpan ke database
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

// Verifikasi password saat login
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// Generate JWT token setelah login berhasil
export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verifikasi JWT token dari request header
export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

// Register: cek duplikat nomor HP, hash password, simpan ke DB
export async function registerUser(data: {
  name: string;
  phone: string;
  password: string;
  role?: string;
}) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.phone, data.phone));

  if (existing.length > 0) {
    throw new Error("Nomor HP sudah terdaftar");
  }

  const hashed = await hashPassword(data.password);

  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      phone: data.phone,
      password: hashed,
      role: data.role || "customer",
    })
    .returning({
      id: users.id,
      name: users.name,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
    });

  return user;
}

// Login: cari user by nomor HP, verifikasi password, return token
export async function loginUser(phone: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone));

  if (!user) {
    throw new Error("Nomor HP tidak ditemukan");
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    throw new Error("Password salah");
  }

  const token = generateToken({
    userId: user.id,
    phone: user.phone,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  };
}
