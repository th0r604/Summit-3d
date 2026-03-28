import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getTable } from "@/lib/airtable";
import type { UserRole } from "@/lib/auth-types";

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

          // Simple password check (in production, use bcrypt)
          if (!storedPassword || storedPassword !== password) return null;

          return {
            id: record.id,
            email: record.get("Email") as string,
            name: `${record.get("First Name") || ""} ${record.get("Last Name") || ""}`.trim(),
            role: (record.get("Role") as UserRole) || "member",
            clubId: (record.get("Club") as string[] | undefined)?.[0] || undefined,
            countryId: (record.get("Country") as string[] | undefined)?.[0] || undefined,
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
