import type { AuthUser } from "@/app/types";

type JwtPayload = {
  email?: string;
  role?: string;
  fullName?: string;
  ["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?: string;
  ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]?: string;
};

export function parseAuthUserFromToken(token: string): AuthUser {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return { fullName: "User", email: "", role: "User" };
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = atob(
      normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=")
    );
    const parsedPayload = JSON.parse(decodedPayload) as JwtPayload;

    const role =
      parsedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      parsedPayload.role ??
      "User";

    const fullName =
      parsedPayload.fullName ??
      parsedPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
      parsedPayload.email ??
      "User";

    return {
      email: parsedPayload.email ?? "",
      fullName,
      role,
    };
  } catch {
    return { fullName: "User", email: "", role: "User" };
  }
}
