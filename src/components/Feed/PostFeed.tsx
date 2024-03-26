"use client";

import { ExtendedPost } from "@/types/prisma";
import React, { FC, useEffect, useState } from "react";
import PostCard from "../PostCard";
import { useIntersection } from "@mantine/hooks";
import { loadPosts } from "@/lib/actions";
import { POSTS_PER_PAGE } from "@/config";
import { useToast } from "../ui/Toast";
import type { Session } from "next-auth";
import { Show } from "@/lib/utils";

interface PostFeedProps {
	initialPosts: ExtendedPost[];
	where?: Object;
	session: Session | null;
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, where, session }) => {
	const [posts, setPosts] = useState<ExtendedPost[]>(initialPosts);
	const [shouldLoad, setShouldLoad] = useState(true);
	const toast = useToast();

	const { ref, entry } = useIntersection();

	useEffect(() => {
		if (shouldLoad && entry?.isIntersecting) {
			(async () => {
				const morePosts = await loadPosts({
					where,
					page: posts.length / POSTS_PER_PAGE,
				});

				if (!morePosts || morePosts.length === 0) {
					setShouldLoad(false);

					toast({
						title: "No more posts",
						message: "You have reached the end of the feed.",
					});
				} else {
					setPosts((prevPosts) => [...prevPosts, ...morePosts]);
				}
			})();
		}
	}, [entry, posts, where, toast, shouldLoad, setShouldLoad]);

	return (
		<>
			{posts.map((post) => (
				<PostCard key={post.id} post={post} session={session} />
			))}

			<Show If={shouldLoad}>
				<PostPlaceholder ref={ref} />
			</Show>
		</>
	);
};
PostFeed.displayName = "PostFeed";

const PostPlaceholder = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	(props, ref) => {
		return (
			<div ref={ref} {...props} className="animate-pulse overflow-hidden rounded-lg bg-neutral-50">
				<div className="flex gap-4 px-6 py-4">
					<div className="space-y-4">
						<div className="h-6 w-6 rounded-md bg-neutral-200 bg-opacity-50" />
						<div className="h-6 w-6 rounded-md bg-neutral-200 bg-opacity-50" />
						<div className="h-6 w-6 rounded-md bg-neutral-200 bg-opacity-50" />
					</div>
					<div className="grow space-y-4">
						<div className="h-2 w-80 rounded-xl bg-neutral-200 bg-opacity-50" />
						<div className="h-8 w-56 rounded-xl bg-neutral-200 bg-opacity-50" />
						<div className="h-4 w-full rounded-xl bg-neutral-200 bg-opacity-50" />
						<div className="h-4 w-full rounded-xl bg-neutral-200 bg-opacity-50" />
					</div>
				</div>
				<div className="h-10 bg-zinc-100" />
			</div>
		);
	}
);
PostPlaceholder.displayName = "PostPlaceholder";

export default PostFeed;
