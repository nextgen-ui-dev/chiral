import { useRouter } from "next/router";
import React, { useEffect } from "react";
import axios from "axios";
import { api } from "~/utils/api";
import Head from "next/head";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import PriorityBar from "./PriorityBar";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { withAuth } from "~/components/withAuth";

const IssueDetailPage = withAuth(() => {
  const router = useRouter();
  const issueId = router.asPath
    .replace("/", "")
    .replace("/generate", "")
    .split("/")[1]!;

  const { data: sessionData, isLoading: sessionIsLoading } = 
    api.user.getSessionInfo.useQuery();
  
  const { data: IssueDetailData, isLoading: issueIsLoading, error } = 
    api.workspace.linear.getIssueById.useQuery({
      issueId
    }, {
      refetchOnWindowFocus: false
    });

  useEffect(() => {
    const [workspaceId, issueId] = router.asPath
      .replace("/", "")
      .replace("/generate", "")
      .split("/");

      if (!sessionIsLoading && sessionData?.session?.workspace_id !== workspaceId)
      void (async function (workspaceId: string, sessionId: string) {
        await axios.post("/api/auth/update-session", {
          sessionId,
          workspaceId,
        });
        await router.push("/" + workspaceId + "/generate/" + issueId);
        router.reload();
      })(workspaceId!, sessionData!.session!.id);
  }, [sessionData, router, sessionIsLoading]);
  
  return (
    <>
      <Head>
        <title>
          {!issueIsLoading && error === null
            ? IssueDetailData?.identifier + " | "
            : ""}
          Chiral
        </title>
        <meta name="description" content="Automate your product backlogs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout>
        <div className={`relative flex flex-col h-screen w-full divide`}>
          {/* Breadcrumbs */}
          <div 
            onClick={() => router.back()}
            className="absolute max-w-[50px]: p-2 flex flex-row items-center gap-x-2 rounded-lg top-6 left-6 hover:cursor-pointer"
          >
            <ChevronLeft size={16} />
            Issues List
          </div>

          <div className="pt-[100px]"></div>
          {/* Main Editor Space */}
          <div className={`flex flex-col w-full max-w-3/4 pt-18 pb-12 px-6`}>
            {
              issueIsLoading 
              ? <Skeleton className="w-[0.3] h-[30px] rounded-full" /> 
              : (
                <div className="text-3xl">
                  {/* Issue Title */}
                  {IssueDetailData?.title}
                </div>
              ) 
            }

            <div className="py-4"></div>

            {/* Mini-labels */}
              {
                issueIsLoading 
                ? <Skeleton className="w-[0.2] h-[30px] rounded-full" /> 
                : (
                    <div className={`flex flex-row`}>
                      <div className={`flex flex-row min-w-[60px] items-center px-4 py-2 rounded-full border border-gray-200 gap-x-3`}>
                        <p className="text-lg text-white opacity-70">
                          Priority
                        </p>

                        <div className="flex items-center gap-x-2">
                          <PriorityBar small priorityLevel={IssueDetailData?.priority ?? 0} />
                          <p className="text-md text-white opacity-70">
                            {IssueDetailData?.priorityLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                ) 
              }

            <div className="py-3"></div>

            {
              issueIsLoading 
              ? <Skeleton className="w-[.7] h-[50px] rounded-full" /> 
              : (
                <div className="text-lg lineclamp">
                  {/* Issue Description */}
                  {IssueDetailData?.description}
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt, assumenda quod? Assumenda itaque nihil veniam, maiores consectetur facere eius doloribus laboriosam recusandae voluptates saepe, odio, sit sed aspernatur dolore repellat asperiores dicta nisi. Necessitatibus omnis deleniti doloremque illo a recusandae.
                  <br></br>
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quae dolor, perferendis delectus libero voluptate quos! Dolores perferendis soluta sint sunt. Porro corrupti nisi quas assumenda! Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quae dolor, perferendis delectus libero voluptate quos! Dolores perferendis soluta sint sunt. Porro corrupti nisi quas assumenda!
                </div>
              )
            }

            <div>
              
            </div>
          </div>
          {/* Sidebar Space */}
          {/* <div className={`flex flex-col w-[300px] bg-opacity-50`}>
            
          </div> */}
        </div>
      </DashboardLayout>
    </>
  );
});

export default IssueDetailPage;