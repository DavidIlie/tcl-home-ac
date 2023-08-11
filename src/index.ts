import * as dotenv from "dotenv";
dotenv.config();

import { env } from "./env";

import express, { Express, Request, Response } from "express";
import fetch from "node-fetch";
import { RefreshTokensResponse } from "./types/types";
import { withKEY } from "./lib/middleware";
import { authTCLMiddleware, getPowerState } from "./integrations/tcl";

const app: Express = express();

// com/tcl/bmiot/startup/IotInitialize.java
// TclSmartSdk.getInstance().initSdk(var1, "", ":443", "", "wx6e1af3fa84fbe523", "2024162b231b92a838eea82c9aa7f832", 100);
const appId = "wx6e1af3fa84fbe523";
// which then runs in this code
// this.mAppId = var5;

app.get(
   "/ac/office/get-power-state",
   withKEY,
   authTCLMiddleware,
   async (req: Request, res: Response) => {
      const username = req.data.username;
      const accessToken = req.data.accessToken;

      if (req.data.saasToken) {
         try {
            const state = await getPowerState(req.data.saasToken);
            return res.json(state);
         } catch (_error) {}
      }

      const refreshR = await fetch(
         "https://prod-eu.aws.tcljd.com/v3/auth/refresh_tokens",
         {
            method: "POST",
            compress: true,
            body: JSON.stringify({
               userId: username,
               ssoToken: accessToken,
               appId,
            }),
            headers: {
               "user-agent": "Android",
               "content-type": "application/json; charset=UTF-8",
               "accept-encoding": "gzip, deflate, br",
            },
         }
      );

      const refreshResponse = (await refreshR.json()) as RefreshTokensResponse;
      const saasToken = refreshResponse.data.saasToken;

      await db.update({ saasToken: saasToken });

      req["data"] = db.value;

      const state = await getPowerState(saasToken);
      return res.json(state);
   }
);

app.get(
   "/ac/office/turn-off",
   withKEY,
   async (_req: Request, res: Response) => {
      const r = await fetch(
         `${env.HASS_URL}/api/services/google_assistant_sdk/send_text_command`,
         {
            method: "POST",
            headers: {
               Authorization: `Bearer ${env.HASS_API_TOKEN}`,
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ command: "Turn airco off" }),
         }
      );

      if (r.status === 200) return res.json({ message: "ok" });

      return res.json({ message: "problem" });
   }
);

app.get("/ac/office/turn-on", withKEY, async (_req: Request, res: Response) => {
   const r = await fetch(
      `${env.HASS_URL}/api/services/google_assistant_sdk/send_text_command`,
      {
         method: "POST",
         headers: {
            Authorization: `Bearer ${env.HASS_API_TOKEN}`,
            "Content-Type": "application/json",
         },
         body: JSON.stringify({ command: "Turn airco on" }),
      }
   );

   if (r.status === 200) return res.json({ message: "ok" });

   return res.json({ message: "problem" });
});

app.listen("3000", () => {
   console.log("alive");
});
