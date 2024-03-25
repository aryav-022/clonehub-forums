import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Navbar />

			<main className="mx-auto grid max-w-screen-2xl grid-cols-5 items-start gap-4 px-4 sm:px-6">
				<Sidebar />
				{children}
			</main>
		</>
	);
}
