import Head from "next/head";
import { api } from "~/utils/api";
import { LoadingHero } from "~/layouts/LoadingHero";
import { LandingPage } from "./LandingPage";
import { DashboardPage } from "./DashboardPage";

export const HomePage = () => {
  const { data, isLoading } = api.user.getSessionInfo.useQuery();

  return (
    <>
      <Head>
        <title>Chiral</title>
        <meta name="description" content="Automate your product backlogs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isLoading ? (
        <LoadingHero />
      ) : data?.isAuthenticated ? (
        <DashboardPage />
      ) : (
        <LandingPage />
      )}
    </>
  );
};
