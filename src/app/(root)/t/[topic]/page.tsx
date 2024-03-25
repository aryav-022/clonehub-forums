import { FC } from "react";

interface pageProps {
	params: {
		topic: string;
	};
}

const Page: FC<pageProps> = ({ params: { topic } }) => {
	return <h1>{topic} Comming Soon</h1>;
};

export default Page;
