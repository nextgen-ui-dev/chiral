import type { Document, Project, User } from "@linear/sdk";
import {
  type ColumnDef,
  type SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

type DocumentData = Pick<Document, "id" | "title"> & {
  creator: User | undefined;
  project: Project | undefined;
};

const columns: ColumnDef<DocumentData>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex flex-row items-center gap-2 p-0 font-bold hover:bg-inherit"
        >
          Title
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "creator",
    header: "Creator",
  },
  {
    accessorKey: "project",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex flex-row items-center gap-2 p-0 font-bold hover:bg-inherit"
        >
          Project
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
  },
];

export const DocumentsDataTable: React.FC<{ documents: DocumentData[] }> = ({
  documents,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: documents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const router = useRouter();

  return (
    <div className="my-8 rounded-md border border-primary-dark">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-primary-dark hover:bg-primary-dark"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 &&
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() =>
                  void router.push(router.asPath + "/" + row.original.id)
                }
              >
                {row.getVisibleCells().map((cell) => {
                  if (cell.column.id === "project") {
                    return (
                      <TableCell key={cell.id}>
                        {cell.row.original.project?.name}
                      </TableCell>
                    );
                  } else if (cell.column.id === "creator") {
                    return (
                      <TableCell key={cell.id}>
                        {cell.row.original.creator?.displayName}
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};
