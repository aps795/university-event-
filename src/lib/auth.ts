import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { UserSession } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "dhsgsu_eventhub_jwt_secret_key_2026_central_university_sagar";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: UserSession): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      enrollmentNumber: user.enrollmentNumber,
      course: user.course,
      department: user.department,
      semester: user.semester,
      phone: user.phone,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    // 1. Try Cookie
    const cookieStore = cookies();
    const cookieToken = cookieStore.get("dhsgsu_token")?.value;
    if (cookieToken) {
      const verified = verifyToken(cookieToken);
      if (verified) return verified;
    }

    // 2. Try Authorization header
    const headerStore = headers();
    const authHeader = headerStore.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const bearerToken = authHeader.substring(7);
      return verifyToken(bearerToken);
    }

    return null;
  } catch {
    return null;
  }
}
