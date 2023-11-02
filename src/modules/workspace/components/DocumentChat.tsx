import { zodResolver } from "@hookform/resolvers/zod";
import { useChat } from "ai/react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/utils/api";
import { SystemChat } from "./SystemChat";
import { UserChat } from "./UserChat";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { ArrowUp, File } from "lucide-react";
import type { Document, Project, User } from "@linear/sdk";
import { useEffect } from "react";

type DocumentData = Pick<Document, "id" | "title" | "content"> & {
  creator: User | undefined;
  project: Project | undefined;
};

const chatFormSchema = z.object({
  text: z.string().min(1, "Text is too short.").max(400, "Text is too long."),
});

export const DocumentChat: React.FC<{ document: DocumentData }> = ({
  document,
}) => {
  const chatForm = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      text: "",
    },
  });

  const { data: initialMessages } =
    api.workspace.document.getDocumentMessages.useQuery({
      providerDocumentId: document.id,
    });

  const {
    messages,
    isLoading: messagesLoading,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat({
    api: "/api/chat/" + document.id,
    initialMessages: initialMessages?.map((msg) => ({
      id: msg.id,
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    })),
  });

  const {
    mutateAsync: saveEmbeddings,
    isLoading: saveEmbeddingsLoading,
    isSuccess: saveEmbeddingsSuccess,
  } = api.workspace.document.saveMarkdownEmbeddings.useMutation();

  useEffect(() => {
    void (async function () {
      if (typeof document.content !== "undefined" && !saveEmbeddingsSuccess) {
        await saveEmbeddings({
          markdown: document.content,
          documentId: document.id,
        });
      }
    })();
  }, [document, saveEmbeddingsSuccess, saveEmbeddings]);

  return (
    <div className="flex h-20 w-full flex-col gap-2 bg-primary-darker px-2 py-3">
      <div className="flex w-full flex-row items-center gap-1">
        <File className="h-6 w-6" />
        <h1 className="text-xl font-medium">
          {document.title.length > 38
            ? document.title.substring(0, 38) + "..."
            : document.title}
        </h1>
      </div>
      <div className="flex w-full flex-row items-center gap-2">
        <p className="text-sm text-slate-300">Project:</p>
        <p className="text-sm">{document.project?.name}</p>
      </div>
      <div className="relative flex min-h-[calc(100vh-5rem)] w-full flex-col">
        {saveEmbeddingsLoading ? (
          <div className="flex h-full w-full animate-pulse flex-col items-center justify-center p-8 text-center">
            <Image
              src="/favicon.ico"
              alt="Chiral Icon"
              width={60}
              height={60}
            />
            <p className="mt-4 text-xl text-slate-300">
              Loading document context...
            </p>
          </div>
        ) : (
          <>
            <div className="flex h-[calc(100vh-5rem)] w-full flex-col gap-y-5 overflow-y-auto pt-6">
              <SystemChat text="Greetings! My name is Chiral and I'm here to help answer questions regarding your document." />
              {!messagesLoading &&
                messages?.map((message) => {
                  if (message.role == "assistant") {
                    return (
                      <SystemChat key={message.id} text={message.content} />
                    );
                  }

                  return <UserChat key={message.id} text={message.content} />;
                })}
            </div>
            <Form {...chatForm}>
              <form
                className="flex w-full flex-row gap-3 bg-background pb-2 pt-4"
                onSubmit={handleSubmit}
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
                          value={input}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={messagesLoading}
                  type="submit"
                  size="icon"
                  className="rounded-full p-2"
                >
                  <ArrowUp className="h-6 w-6" />
                </Button>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  );
};
