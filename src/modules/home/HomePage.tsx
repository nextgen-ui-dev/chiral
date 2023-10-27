import Head from "next/head";
import { api } from "~/utils/api";
import { LoadingHero } from "~/layouts/LoadingHero";
import { LandingPage } from "./LandingPage";
import { useEffect } from "react";
import { useRouter } from "next/router";

export const HomePage = () => {
  const { data, isLoading } = api.user.getSessionInfo.useQuery();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && data?.isAuthenticated) {
      void router.push("/" + data.session?.workspace_id);
    }
  }, [router, isLoading, data]);

  return (
    <>
      <Head>
        <title>Chiral</title>
        <meta name="description" content="Automate your product backlogs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isLoading ? <LoadingHero /> : !data?.isAuthenticated && <LandingPage />}
    </>
  );
};
