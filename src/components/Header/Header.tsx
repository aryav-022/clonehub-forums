import { db } from "@/lib/db";
import { ActionResponse, Prettify } from "@/lib/utils";
import { Community, Post, User } from "@prisma/client";
import type { Session } from "next-auth";
import { FC } from "react";
import Paragraph from "./Paragraph";
import { JoinCommunityForm, LeaveCommunityForm } from "./Forms";
import Link from "next/link";
import { buttonVariants } from "../ui/Button";
import Image from "next/image";

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
		<header className="col-span-4 space-y-4 border-b pb-4">
			{/* Banner */}
			<div className="h-56 w-full overflow-hidden rounded-lg bg-neutral-300">
				{community.banner && (
					<Image
						src={community.banner}
						alt="Community Banner"
						height={224}
						width={1024}
						className="h-56 w-full rounded-lg"
					/>
				)}
			</div>

			<div className="mb-8 flex items-start gap-6 px-8">
				{/* Profile Photo */}
				<div className="relative bottom-10">
					<div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white bg-neutral-800">
						{community.image && (
							<Image
								src={community.image}
								alt="Profile Picture"
								height={96}
								width={96}
								className="h-24 w-24 rounded-full"
							/>
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
					<Controllers community={community} session={session} />
				</div>
			</div>
		</header>
	);
};

async function Controllers({ community, session }: HeaderProps) {
	if (!session) {
		return (
			<Link href="/signin" className={buttonVariants({ size: "lg" })}>
				Signin to join community
			</Link>
		);
	}

	if (session.user.id === community.creatorId) {
		return (
			<Link href={`/c/${community.name}/dashboard`} className={buttonVariants({ size: "lg" })}>
				Community Dashboard
			</Link>
		);
	}

	async function joinCommunity() {
		"use server";

		try {
			// Check if user is logged in
			if (!session) {
				return ActionResponse(401, "You must be logged in to join a community.");
			}

			// Check if user is already a member
			const isMember = await db.community.findFirst({
				where: {
					id: community.id,
					members: { some: { id: session.user.id } },
				},
			});

			if (isMember) {
				return ActionResponse(400, "You are already a member of this community.");
			}

			// Add user to community
			await db.community.update({
				where: { id: community.id },
				data: {
					members: {
						connect: { id: session.user.id },
					},
				},
			});

			return ActionResponse(200, "You have successfully joined the community.");
		} catch (error) {
			return ActionResponse(500, "An error occurred while joining the community.");
		}
	}

	async function leaveCommunity() {
		"use server";

		try {
			// Check if user is logged in
			if (!session) {
				return ActionResponse(401, "You must be logged in to leave a community.");
			}

			// check if user is the creator
			if (session.user.id === community.creatorId) {
				return ActionResponse(403, "You cannot leave the community as the creator.");
			}

			// Check if user is a member
			const isMember = await db.community.findFirst({
				where: {
					id: community.id,
					members: { some: { id: session.user.id } },
				},
			});

			if (!isMember) {
				return ActionResponse(400, "You are not a member of this community.");
			}

			// Remove user from community
			await db.community.update({
				where: { id: community.id },
				data: {
					members: {
						disconnect: { id: session.user.id },
					},
				},
			});

			return ActionResponse(200, "You have successfully left the community.");
		} catch (error) {
			return ActionResponse(500, "An error occurred while leaving the community.");
		}
	}

	const isMember = await db.community.findFirst({
		where: {
			id: community.id,
			members: { some: { id: session.user.id } },
		},
	});

	if (isMember) {
		return <LeaveCommunityForm leaveCommunity={leaveCommunity} />;
	}

	return <JoinCommunityForm joinCommunity={joinCommunity} />;
}

export default Header;
