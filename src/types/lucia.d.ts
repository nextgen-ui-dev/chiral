/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("~/server/auth").Auth;
  type DatabaseUserAttributes = {
    email: string;
    name: string | null;
    avatar_url: string | null;
  };
  type DatabaseSessionAttributes = {
    account_id: string;
    workspace_id: string;
    access_token: string | null;
  };
}
