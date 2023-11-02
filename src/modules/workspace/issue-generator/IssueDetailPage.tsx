import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

const IssueDetailPage = () => {
  const router = useRouter();
  const issueId = router.asPath
    .replace("/", "")
    .replace("/generate", "")
    .split("/")[1]!;

  const { data: sessionData, isLoading: sessionIsLoading } = 
    api.user.getSessionInfo.useQuery();
  
  const { data: IssueDetailData, isLoading: issueIsLoading } = 
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
    <div>
      Issue Detail Page for issue no {issueId}
    </div>
  );
};

export default IssueDetailPage;