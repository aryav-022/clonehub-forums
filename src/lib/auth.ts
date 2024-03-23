import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { nanoid } from "nanoid";
import type { Session } from "next-auth";
import { NextAuthOptions, getServerSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";

export const options: NextAuthOptions = {
	adapter: PrismaAdapter(db),
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXT_AUTH_SECRET!,
	pages: {
		signIn: "/signin",
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async session({ session, token }: { session: Session; token: JWT }) {
			if (token) {
				session.user.id = token.id;
				session.user.name = token.name;
				session.user.email = token.email;
				session.user.image = token.image;
				session.user.username = token.username;
			}

			return session;
		},
		async jwt({ token, user }) {
			const dbUser = await db.user.findFirst({
				where: {
					email: token.email,
				},
			});

			if (!dbUser) {
				token.id = user.id;
				return token;
			}

			if (!dbUser.username) {
				await db.user.update({
					where: {
						id: dbUser.id,
					},
					data: {
						username: nanoid(10),
					},
				});
			}

			return {
				id: dbUser.id,
				name: dbUser.name,
				email: dbUser.email,
				image: dbUser.image,
				username: dbUser.username,
			};
		},
		redirect() {
			return "/";
		},
	},
};

export const getAuthSession = () => getServerSession(options);
