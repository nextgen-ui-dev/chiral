import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getSessionInfo: protectedProcedure.query(({ ctx }) => {
    return { session: ctx.session, isAuthenticated: ctx.session !== null };
  }),
});
