// Server function RPC wrapper for store diagnostics.
import { createServerFn } from "@tanstack/react-start";
import { runDiagnostics } from "./diagnostics.server";

export const getStoreDiagnostics = createServerFn({ method: "GET" }).handler(async () => {
  return await runDiagnostics();
});
