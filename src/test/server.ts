import { setupServer } from "msw/node";

/** No default handlers: each test declares its own. An unexpected call
 *  fails loudly instead of getting a phantom response. */
export const server = setupServer();
