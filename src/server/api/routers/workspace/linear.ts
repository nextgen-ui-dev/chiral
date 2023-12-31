import { z } from "zod";
import { createTRPCRouter, linearProcedure } from "../../trpc";
import { LinearError, type Issue } from "@linear/sdk";
import { TRPCError } from "@trpc/server";

export const linearRouter = createTRPCRouter({
  getTeams: linearProcedure.query(async ({ ctx }) => {
    const res = await ctx.linearClient.teams();

    // return { meta: res.pageInfo, teams: res.nodes };
    return res.nodes;
  }),

  getTeamById: linearProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const team = await ctx.linearClient.team(input.teamId);

        return team;
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong when querying the team",
        });
      }
    }),

  getDocumentDetail: linearProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const res = await ctx.linearClient.document(input.documentId);
        const document = {
          ...res,
          creator: await res.creator,
          project: await res.project,
        };

        return document;
      } catch (e) {
        if (
          e instanceof LinearError &&
          e.message === "Entity not found - Could not find referenced Document."
        )
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Can't find document",
          });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  getDocuments: linearProcedure.query(async ({ ctx }) => {
    const res = await ctx.linearClient.documents();
    const meta = res.pageInfo;
    const documents = await Promise.all(
      res.nodes.map(async (doc) => ({
        ...doc,
        project: await doc.project,
        creator: await doc.creator,
      })),
    );

    return { meta, documents };
  }),

  getProjects: linearProcedure.query(async ({ ctx }) => {
    const res = await ctx.linearClient.projects();
    const meta = res.pageInfo;
    const projects = await Promise.all(
      res.nodes.map(async (res) => ({
        ...res,
        creator: await res.creator,
        documents: await res.documents()
      })),
    );
    return { meta, projects };
  }),

  getProjectDetail: linearProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const res = await ctx.linearClient.project(input.projectId);
        const project = {
          ...res,
          creator: await res.creator,
          docs: await res.creator,
        };

        return project;
      } catch (e) {
        if (
          e instanceof LinearError &&
          e.message === "Entity not found - Could not find referenced Document."
        )
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Can't find document",
          });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  getIssues: linearProcedure.query(async ({ ctx }) => {
    const res = await ctx.linearClient.issues();

    const meta = res.pageInfo;

    const issues = await Promise.all(
      res.nodes.map(async (issue) => ({
        ...issue,
        project: await issue.project,
        creator: await issue.creator,
      })),
    );

    return { meta, issues };
  }),

  // TEMPORARILY, getGeneratedIssues would be the same as getIssues for test purposes
  getGeneratedIssues: linearProcedure.query(async ({ ctx }) => {
    const res = await ctx.linearClient.issues();

    const meta = res.pageInfo;

    const issues = await Promise.all(
      res.nodes.map(async (issue: Issue) => ({
        ...issue,
        project: await issue.project,
        creator: await issue.creator,
      })),
    );

    return { meta, issues };
  }),

  getIssueById: linearProcedure
    .input(z.object({ issueId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const res = await ctx.linearClient.issue(input.issueId);
        const issue = {
          ...res,
          creator: await res.creator,
          project: await res.project,
        };

        return issue;
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong when querying the issue",
        });
      }
    }),

});
