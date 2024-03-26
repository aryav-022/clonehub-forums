"use client";

import { cn } from "@/lib/utils";
import { FC, forwardRef, useRef, useState } from "react";

interface ParagraphProps extends React.HTMLProps<HTMLParagraphElement> {
	lineClamp: string;
}

const Paragraph: FC<ParagraphProps> = forwardRef<HTMLParagraphElement, ParagraphProps>(
	({ children, lineClamp, onClick: callback, className, ...props }, ref) => {
		function toggleLineClamp(e: any) {
			e.target.classList.toggle(lineClamp);
			if (callback) callback(e);
		}

		return (
			<p
				ref={ref}
				className={cn("cursor-pointer", className, lineClamp)}
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
