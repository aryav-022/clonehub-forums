import ChatContainer from "@/components/Chat/ChatContainer";
import ChatProvider from "@/components/Chat/ChatContext";
import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getAuthSession } from "@/lib/auth";

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getAuthSession();

	return (
		<ChatProvider session={session}>
			<Navbar />

			<main className="mx-auto grid max-w-screen-2xl grid-cols-5 items-start gap-4 px-4 sm:px-6">
				<Sidebar />
				{children}
			</main>

			<ChatContainer />
		</ChatProvider>
	);
}
