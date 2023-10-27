import React from "react";
import { api } from "~/utils/api";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: user, isLoading } = api.user.getCurrentUser.useQuery();
  return (
    !isLoading && (
      <div className="flex min-h-screen w-full flex-row">
        <nav className="min-h-screen min-w-[20rem] max-w-xs overflow-x-clip border-r-[1px] border-solid border-primary-dark p-4">
          {user?.name}
        </nav>
        <main className="w-full">{children}</main>
      </div>
    )
  );
};
