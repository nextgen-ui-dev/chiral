import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getSessionInfo: publicProcedure.query(({ ctx }) => {
    return { session: ctx.session, isAuthenticated: ctx.session !== null };
  }),
});
