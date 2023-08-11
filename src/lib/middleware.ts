import { NextFunction, Request, Response } from "express";

import { env } from "../env";

export const withKEY = (req: Request, res: Response, next: NextFunction) => {
   const key = req.query["access"] || req.query["key"];

   if (key !== env.SECURE_KEY)
      return res.status(401).json({ message: "no auth" });

   return next();
};
