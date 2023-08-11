import fetch from "node-fetch";
import { Request, Response, NextFunction } from "express";
import * as crypto from "crypto";

import { UserLoginResponse } from "../types/types";
import { env } from "../env";
import { db } from "../lib/db";

// from what I can tell, the clientId is the same for any account: 54148614
// com/tcl/tclhome/repository/server/host/HostChangeHelper.java
// if (environmentType == 2) {
//   var1 = "54148614";
// } else {
//   var1 = "99242549";
//}
export const CLIENT_ID = "54148614";

export const doAccountAuth = async () => {
   const password = crypto
      .createHash("md5")
      .update(env.TCL_PASSWORD)
      .digest("hex");

   const loginR = await fetch(
      `https://pa.account.tcl.com/account/login?clientId=${CLIENT_ID}`,
      {
         method: "POST",
         body: JSON.stringify({
            equipment: 2,
            password: password,
            osType: 1,
            username: env.TCL_USERNAME,
            clientVersion: "4.8.1",
            osVersion: "6.0",
            deviceModel: "AndroidAndroid SDK built for x86",
            captchaRule: 2,
            channel: "app",
         }),
         headers: {
            th_platform: "android",
            th_version: "4.8.1",
            th_appbulid: "830",
            "user-agent": "Android",
            "content-type": "application/json; charset=UTF-8",
         },
         compress: true,
      }
   );

   return (await loginR.json()) as UserLoginResponse;
};

export const getPowerState = async (saasToken: string) => {
   const timestamp: string = String(Date.now());
   const nonce: string = Math.random().toString(36).substring(2);
   const sign = calculateMD5HashBytes(timestamp + nonce + saasToken);

   const { country } = db.value as { country: string };

   const r = await fetch("https://prod-eu.aws.tcljd.com/v3/user/get_things", {
      method: "POST",
      headers: {
         platform: "android",
         appversion: "5.4.1",
         thomeversion: "4.8.1",
         accesstoken: saasToken,
         countrycode: country,
         "accept-language": "en",
         timestamp,
         nonce,
         sign,
         "user-agent": "Android",
         "content-type": "application/json; charset=UTF-8",
         "accept-encoding": "gzip, deflate, br",
      },
      body: JSON.stringify({}),
   });

   const response = await r.json();

   if (r.status !== 200) return { error: response };

   return {
      on:
         parseInt(response.data[0].identifiers[0].value) === 1
            ? "true"
            : "false",
   };
};

export const authTCLMiddleware = async (
   req: Request,
   _res: Response,
   next: NextFunction
) => {
   let data = db.value;

   if (!data.accessToken) {
      const account = await doAccountAuth();
      await db.set({
         accessToken: account.token,
         refreshToken: account.refreshtoken,
         username: account.user.username,
         country: account.user.countryAbbr,
         saasToken: db.value.saasToken || null,
      });
      data = db.value;
   }

   const r = await fetch(
      `https://pa.account.tcl.com/user/getUserInfo?clientId=${CLIENT_ID}&token=${data.accessToken}&username=${data.username}`
   );

   if (r.status !== 200) {
      // make it try refresh

      const account = await doAccountAuth();
      await db.set({
         accessToken: account.token,
         refreshToken: account.refreshtoken,
         username: account.user.username,
         country: account.user.countryAbbr,
         saasToken: db.value.saasToken || null,
      });
      data = db.value;
   }

   req["data"] = data;

   next();
};

export const calculateMD5HashBytes = (input: string): string => {
   try {
      const hash = crypto.createHash("md5").update(input).digest();
      const hexChars: string[] = [];
      for (let i = 0; i < hash.length; ++i) {
         let byteValue = hash[i] & 255;
         if (byteValue < 16) {
            hexChars.push("0");
         }
         hexChars.push(byteValue.toString(16));
      }
      return hexChars.join("");
   } catch (error) {
      console.error(error);
      return "";
   }
};
