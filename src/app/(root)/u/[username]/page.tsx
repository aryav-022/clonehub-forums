import { FC } from "react";

interface pageProps {
  params: { username: string };
}

const Page: FC<pageProps> = ({ params: { username } }) => {
  return (
    <section className="col-span-2 min-h-dvh space-y-4 pb-4">
      {username}
    </section>
  );
};

export default Page;
