"use client";

import { cn } from "@/lib/utils";
import { FC, forwardRef, useState } from "react";

interface ParagraphProps extends React.HTMLProps<HTMLParagraphElement> {
	lineClamp?: string;
}

const Paragraph: FC<ParagraphProps> = forwardRef<HTMLParagraphElement, ParagraphProps>(
	({ children, lineClamp, onClick: callback, className, ...props }, ref) => {
		const [isClamped, setIsClamped] = useState(true);

		function toggleLineClamp(e: any) {
			setIsClamped((prev) => !prev);
			if (callback) callback(e);
		}

		return (
			<p
				ref={ref}
				className={cn("cursor-pointer", className, { lineClamp: isClamped })}
				{...props}
				onClick={toggleLineClamp}
			>
				{children}
			</p>
		);
	}
);
Paragraph.displayName = "Paragraph";

export default Paragraph;
