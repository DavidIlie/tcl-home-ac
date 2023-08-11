import type { Type } from "../lib/db";

export type UserLoginResponse = {
   user: {
      countryAbbr: string;
      phoneAbbr: string;
      nickname: string;
      username: string;
      bindName: string;
      type: number;
      createTime: number;
      updateTime: number;
      headpic: string;
      email: string;
      clientId: number;
      tenantId: number;
      source: number;
      platform: number;
      protocol: number;
      isprivate: number;
      region: string;
      tclid: string;
      isFirstLogin: string;
      crossRegion: boolean;
   };
   status: number;
   token: string;
   refreshtoken: string;
   data: {
      loginAccount: string;
      loginType: number;
      loginCountryAbbr: string;
   };
   msg: string;
   firstLogin: number;
};

export type RefreshTokensResponse = {
   code: number;
   message: string;
   data: {
      saasToken: string;
      cognitoId: string;
      cognitoToken: string;
      mqttEndpoint: string;
   };
};

declare global {
   namespace Express {
      interface Request {
         data: Type;
      }
   }
}
