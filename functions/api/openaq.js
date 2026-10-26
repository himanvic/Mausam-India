import { onRequest as catchAllRequest } from "./[[path]].js";

export async function onRequest(context) {
  return catchAllRequest(context);
}
