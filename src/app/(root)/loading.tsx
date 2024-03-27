export default function Loading() {
	return (
		<div className="col-span-4 my-4 grid h-full w-full animate-pulse place-items-center bg-neutral-50">
			<div className="h-8 w-8 animate-spin rounded-full border-r-4 border-t-4 border-orange-500" />
		</div>
	);
}
