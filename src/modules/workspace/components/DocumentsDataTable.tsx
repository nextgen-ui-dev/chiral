import type { Document, Project, User } from "@linear/sdk";

type DocumentData = Pick<Document, "id" | "title"> & {
  creator: User | undefined;
  project: Project | undefined;
};

export const DocumentsDataTable: React.FC<{ documents: DocumentData[] }> = ({
  documents,
}) => {
  return (
    <ul className="my-4 overflow-y-auto">
      {documents.map((document) => {
        return (
          <li
            key={document.id}
            className="flex flex-row items-center justify-between"
          >
            <p>{document.title}</p>
            <p>{document.creator?.displayName}</p>
            <p>{document.project?.name}</p>
          </li>
        );
      })}
    </ul>
  );
};
