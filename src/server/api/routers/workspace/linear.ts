import { createTRPCRouter, linearProcedure } from "../../trpc";

export const linearRouter = createTRPCRouter({
  getTeams: linearProcedure.query(async ({ ctx }) => {
    const res = await ctx.linearClient.teams();

    return { meta: res.pageInfo, teams: res.nodes };
  }),

  getDocuments: linearProcedure.query(async ({ ctx }) => {
    const res = await ctx.linearClient.documents();
    const meta = res.pageInfo;
    const documents = await Promise.all(
      res.nodes.map(async (doc) => ({
        ...doc,
        project: await doc.project,
      })),
    );

    return { meta, documents };
  }),
});
