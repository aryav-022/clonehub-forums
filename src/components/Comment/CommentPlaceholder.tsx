"use client";

import React from "react";

const CommentPlaceholder = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
	(props, ref) => {
		return (
			<li ref={ref} {...props} className="animate-pulse space-y-2">
				<p className="h-4 w-1/2 rounded-lg bg-neutral-200"></p>
				<p className="h-4 w-3/4 rounded-lg bg-neutral-200"></p>
			</li>
		);
	}
);
CommentPlaceholder.displayName = "CommentPlaceholder";

export default CommentPlaceholder;
