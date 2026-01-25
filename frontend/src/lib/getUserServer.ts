import { cookies } from "next/headers";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

type DecodedUser = JwtPayload & {
    id?: string;
    email?: string;
    role?: string;
};

export async function getUserServer(): Promise<DecodedUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) {
        return null;
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        console.warn("JWT_ACCESS_SECRET is not set; cannot verify token server-side.");
        return null;
    }

    try {
        return jwt.verify(token, secret) as DecodedUser;
    } catch (error) {
        // Silently treat expired tokens as unauthenticated to avoid error noise
        if (error instanceof TokenExpiredError || (error as any)?.name === "TokenExpiredError") {
            return null;
        }
        console.error("Failed to verify access token on server", error);
        return null;
    }
}
