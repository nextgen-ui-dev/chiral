import { createTRPCRouter, linearProcedure } from "../../trpc";

export const linearRouter = createTRPCRouter({
  getTeams: linearProcedure.query(async ({ ctx }) => {
    const res = await ctx.linearClient.teams();

    return { meta: res.pageInfo, teams: res.nodes };
  }),

  getDocuments: linearProcedure.query(async ({ ctx }) => {
    const res = await ctx.linearClient.documents();

    return { meta: res.pageInfo, documents: res.nodes };
  }),
});
