import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        isAdmin: { label: "isAdmin", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const isAdmin = credentials.isAdmin === "true";

        if (isAdmin) {
          const admin = await prisma.admin.findUnique({ where: { email } });
          if (!admin || !admin.passwordHash) {
            throw new Error("Email ou senha inválidos");
          }
          if (!admin.isActive) {
            throw new Error("Conta desativada");
          }
          const valid = await bcrypt.compare(password, admin.passwordHash);
          if (!valid) {
            throw new Error("Email ou senha inválidos");
          }
          await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLogin: new Date() },
          });
          return {
            id: admin.id,
            email: admin.email,
            name: admin.fullName,
            role: "admin",
          };
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
          throw new Error("Email ou senha inválidos");
        }
        if (user.status !== "ACTIVE") {
          throw new Error("Conta desativada");
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          throw new Error("Email ou senha inválidos");
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: "user",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
        token.fullName = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).fullName = token.fullName;
      }
      return session;
    },
  },
});
