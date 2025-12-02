import serverless from "serverless-http";
import { app } from "../../server/stripeBackend";

export const handler = serverless(app);