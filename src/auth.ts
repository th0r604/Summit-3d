import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getTable } from "@/lib/airtable";
import type { UserRole } from "@/lib/auth-types";

// Types that are allowed to log in
const MEMBER_TYPES = ["Athlete", "Technical Official", "Coach"];
const CLUB_ADMIN_TYPES = ["Club Manager", "Brand Manager"];
const ADMIN_TYPES = ["Admin"];
const BLOCKED_TYPES = ["Parent / Guardian / Family", "Other"];

function mapTypeToRole(type: string | undefined): UserRole | null {
  if (!type || BLOCKED_TYPES.includes(type)) return null;
  if (ADMIN_TYPES.includes(type)) return "nf_admin";
  if (CLUB_ADMIN_TYPES.includes(type)) return "club_admin";
  if (MEMBER_TYPES.includes(type)) return "member";
  return null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        try {
          const table = getTable("people");
          const records = await table
            .select({
              filterByFormula: `LOWER({Email}) = "${email}"`,
              maxRecords: 1,
            })
            .all();

          if (records.length === 0) return null;

          const record = records[0];
          const storedPassword = record.get("Password") as string;

          if (!storedPassword) return null;

          // Support both bcrypt hashes and plain text (for migration)
          const isValid = storedPassword.startsWith("$2")
            ? await bcrypt.compare(password, storedPassword)
            : storedPassword === password;
          if (!isValid) return null;

          const role = mapTypeToRole(record.get("Type") as string | undefined);
          if (!role) return null; // Type not allowed to log in

          return {
            id: record.id,
            email: record.get("Email") as string,
            name: `${record.get("First Name") || ""} ${record.get("Last Name") || ""}`.trim(),
            role,
            clubId: (record.get("Club") as string[] | undefined)?.[0] || undefined,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as Record<string, unknown>).role;
        token.clubId = (user as Record<string, unknown>).clubId;
        token.countryId = (user as Record<string, unknown>).countryId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as unknown as Record<string, unknown>;
        user.id = token.sub;
        user.role = token.role;
        user.clubId = token.clubId;
        user.countryId = token.countryId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
