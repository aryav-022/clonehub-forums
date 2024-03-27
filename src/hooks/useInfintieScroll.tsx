"use client";

import { useIntersection } from "@mantine/hooks";
import { useEffect, useState } from "react";

export function useInfiniteScroll<T>(
	initialData: Array<T>,
	loadMore: (page: number) => Promise<Array<T>>
) {
	const [data, setData] = useState(initialData);
	const [shouldLoad, setShouldLoad] = useState<boolean>(true);
	const [page, setPage] = useState<number>(0);

	const { ref, entry } = useIntersection();

	useEffect(() => {
		if (shouldLoad && entry?.isIntersecting) {
			(async () => {
				const newData = await loadMore(page + 1);

				if (newData.length === 0) {
					setShouldLoad(false);
				} else {
					setData((prev) => [...prev, ...newData]);
					setPage((prev) => prev + 1);
				}
			})();
		}
	}, [entry, shouldLoad, loadMore, setData, setShouldLoad, setPage, page]);

	return { ref, data, setData, shouldLoad, setShouldLoad };
}
