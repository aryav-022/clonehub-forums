import { db } from "@/lib/db";
import { Prettify, cn } from "@/lib/utils";
import type { Community } from "@prisma/client";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { JoinCommunityForm, LeaveCommunityForm, Size } from "../Forms";
import { buttonVariants } from "../ui/Button";
import Paragraph from "./Paragraph";

type ExtendedCommunity = Prettify<
	Community & {
		_count: {
			members: number;
			posts: number;
		};
	}
>;

interface HeaderProps {
	community: ExtendedCommunity;
	session: Session | null;
}

const Header: FC<HeaderProps> = async ({ community, session }) => {
	return (
		<header className="col-span-4 border-b pb-4 sm:space-y-4">
			{/* Banner */}
			<div className="relative h-56 w-full overflow-hidden rounded-lg bg-neutral-300">
				{community.banner && (
					<Image
						src={community.banner}
						alt="Community Banner"
						fill
						className="object-cover rounded-lg"
					/>
				)}
			</div>

			<div className="mb-8 flex items-start max-sm:flex-col sm:gap-6 sm:px-8">
				{/* Profile Photo */}
				<div className="relative bottom-10 max-sm:mx-auto">
					<div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border-2 border-white bg-neutral-800">
						{community.image && (
							<Image src={community.image} alt="Profile Picture" fill className="object-cover" />
						)}
					</div>
				</div>

				{/* Remaining */}
				<div className="lg:max-w-[80%]">
					{/* Community Description */}
					<h1 className="text-4xl font-bold">{community.name}</h1>
					<Paragraph className="mt-2 text-neutral-500" lineClamp="line-clamp-3">
						{community.description}
					</Paragraph>

					{/* Community Stats */}
					<div className="my-4 flex gap-x-6">
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-bold">{community._count.members}</h1>
							<p className="font-medium text-neutral-500">Members</p>
						</div>

						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-bold">{community._count.posts}</h1>
							<p className="font-medium text-neutral-500">Posts</p>
						</div>
					</div>

					{/* Controlls */}
					<div className="w-fit">
						<Controllers community={community} session={session} size="lg" />
					</div>
				</div>
			</div>
		</header>
	);
};

interface ControllersProps {
	community: Community;
	session: Session | null;
	size?: Size;
}

export async function Controllers({ community, session, size }: ControllersProps) {
	if (!session) {
		return (
			<Link href="/signin" className={cn(buttonVariants({ size: "lg", className: "w-full" }))}>
				Signin to join community
			</Link>
		);
	}

	if (session.user.id === community.creatorId) {
		return (
			<Link
				href={`/c/${community.name}/dashboard`}
				className={cn(buttonVariants({ size: "lg", className: "w-full" }))}
			>
				Community Dashboard
			</Link>
		);
	}

	const isMember = await db.community.findFirst({
		where: {
			id: community.id,
			members: { some: { id: session.user.id } },
		},
	});

	if (isMember) {
		return <LeaveCommunityForm id={community.id} size={size} />;
	}

	return <JoinCommunityForm id={community.id} size={size} />;
}

export default Header;
