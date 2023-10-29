import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { withAuth } from "~/components/withAuth";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingHero } from "~/layouts/LoadingHero";
import { ArrowUp, File } from "lucide-react";
import { SystemChat } from "./components/SystemChat";
import { UserChat } from "./components/UserChat";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";

const chatFormSchema = z.object({
  text: z.string().min(1, "Text is too short.").max(400, "Text is too long."),
});

export const DocumentDetailPage = withAuth(() => {
  const router = useRouter();
  const documentId = router.asPath
    .replace("/", "")
    .replace("/documents", "")
    .split("/")[1]!;

  const { data, isLoading } = api.user.getSessionInfo.useQuery();
  const {
    data: documentData,
    isLoading: documentLoading,
    error,
  } = api.workspace.linear.getDocumentDetail.useQuery({ documentId });

  const {
    data: messages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = api.workspace.document.getDocumentMessages.useQuery({
    providerDocumentId: documentId,
  });

  const { mutateAsync: createMessage, isLoading: createMessageLoading } =
    api.workspace.document.createDocumentMessage.useMutation();

  useEffect(() => {
    const [workspaceId, documentId] = router.asPath
      .replace("/", "")
      .replace("/documents", "")
      .split("/");
    if (!isLoading && data?.session?.workspace_id !== workspaceId)
      void (async function (workspaceId: string, sessionId: string) {
        await axios.post("/api/auth/update-session", {
          sessionId,
          workspaceId,
        });
        await router.push("/" + workspaceId + "/documents/" + documentId);
        router.reload();
      })(workspaceId!, data!.session!.id);
  }, [data, router, isLoading]);

  const chatForm = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      text: "",
    },
  });

  const submitChat = async (values: z.infer<typeof chatFormSchema>) => {
    if (typeof chatForm.formState.errors.text === "undefined") {
      await createMessage({
        providerDocumentId: documentId,
        text: values.text,
      });

      await refetchMessages();

      chatForm.reset();
    }
  };

  return (
    <>
      <Head>
        <title>
          {!documentLoading && error === null
            ? documentData?.title + " | "
            : ""}
          Chiral
        </title>
        <meta name="description" content="Automate your product backlogs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout>
        {documentLoading ? (
          <LoadingHero />
        ) : error !== null ? (
          <main className="flex min-h-screen w-full flex-col p-8">
            <h1 className="text-4xl font-bold">{error.message}</h1>
          </main>
        ) : (
          <main className="flex min-h-screen w-full flex-row">
            <div className="flex min-h-screen w-full flex-col"></div>
            <div className="border-primary-darker flex min-h-screen min-w-[28rem] max-w-md border-l-2">
              <div className="bg-primary-darker flex h-20 w-full flex-col gap-2 px-2 py-3">
                <div className="flex w-full flex-row items-center gap-1">
                  <File className="h-6 w-6" />
                  <h1 className="text-xl font-medium">
                    {documentData?.title.length > 38
                      ? documentData?.title.substring(0, 38) + "..."
                      : documentData?.title}
                  </h1>
                </div>
                <div className="flex w-full flex-row items-center gap-2">
                  <p className="text-sm text-slate-300">Project:</p>
                  <p className="text-sm">{documentData?.project?.name}</p>
                </div>
                <div className="relative flex min-h-[calc(100vh-5rem)] w-full flex-col gap-y-5 overflow-y-auto py-6">
                  <SystemChat text="Greetings! My name is Chiral and I'm here to help answer questions regarding your document." />
                  {!messagesLoading &&
                    messages?.map((message) => {
                      console.log(message);
                      if (message.sender == "system") {
                        return (
                          <SystemChat key={message.id} text={message.text} />
                        );
                      }

                      return <UserChat key={message.id} text={message.text} />;
                    })}
                  <Form {...chatForm}>
                    <form
                      className="absolute bottom-0 flex w-full flex-row gap-3 bg-background pb-2 pt-4"
                      onSubmit={chatForm.handleSubmit(submitChat)}
                    >
                      <FormField
                        control={chatForm.control}
                        name="text"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Textarea
                                placeholder="What's the scope of this project?"
                                rows={1}
                                className="resize-none rounded-md"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        disabled={createMessageLoading}
                        type="submit"
                        size="icon"
                        className="rounded-full p-2"
                      >
                        <ArrowUp className="h-6 w-6" />
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </main>
        )}
      </DashboardLayout>
    </>
  );
});
