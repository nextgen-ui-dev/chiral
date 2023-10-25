/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("~/server/auth").Auth;
  type DatabaseUserAttributes = {
    email: string;
    name: string | null;
    avatar_url: string | null;
  };
  type DatabaseSessionAttributes = {
    access_token: string | null;
  };
}
