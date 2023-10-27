import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { LoadingHero } from "~/layouts/LoadingHero";
import { api } from "~/utils/api";

export const withAuth: (component: React.FC) => React.FC = (Component) => {
  return function WithAuth(props: any) {
    const { data, isLoading } = api.user.getSessionInfo.useQuery();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !data?.isAuthenticated) {
        void router.push("/");
      }
    }, [isLoading, data?.isAuthenticated, router]);

    return isLoading ? (
      <LoadingHero />
    ) : (
      data?.isAuthenticated && <Component {...props} session={data.session} />
    );
  };
};
