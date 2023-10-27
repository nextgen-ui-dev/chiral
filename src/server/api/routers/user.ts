import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getSessionInfo: publicProcedure.query(({ ctx }) => {
    return { session: ctx.session, isAuthenticated: ctx.session !== null };
  }),

  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return { ...ctx.session.user };
  }),
});
