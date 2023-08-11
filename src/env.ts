import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
   server: {
      HASS_API_TOKEN: z.string().min(1),
      HASS_URL: z.string().url(),
      SECURE_KEY: z.string().min(3),
      TCL_USERNAME: z.string().min(1),
      TCL_PASSWORD: z.string().min(1),
   },
   runtimeEnv: process.env,
});
