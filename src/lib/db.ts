import { SingleValue } from "nodatabase";

export type Type = {
   username: string | null;
   accessToken: string | null;
   refreshToken: string | null;
   saasToken: string | null;
   country: string | null;
};

declare global {
   var db: SingleValue<Type>;
}

export const db =
   global.db ||
   new SingleValue({
      dirPath: "./data",
      fileName: "config",
      defaultValue: {
         username: null,
         accessToken: null,
         refreshToken: null,
         saasToken: null,
         country: null,
      },
   });

if (process.env.NODE_ENV !== "production") {
   global.db = db;
}
