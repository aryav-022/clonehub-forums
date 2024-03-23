import Navbar from "@/components/Navbar/Navbar";
import { Toaster } from "@/components/ui/Toast";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "CloneHub Forums",
	description:
		"A community-driven forum app where users can engage in discussions, share content, and vote on posts and comments. Join CloneHub's forum to connect with like-minded individuals and explore a wide range of topics.",
};

export default async function RootLayout({
	children,
	authModal,
}: Readonly<{
	children: React.ReactNode;
	authModal: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				{authModal}

				<Toaster>{children}</Toaster>
			</body>
		</html>
	);
}
