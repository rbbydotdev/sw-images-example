import { hc } from "hono/client";
import type { SWClientTypes } from "./sw";

// Construct the base URL with the base path
const basePath = __BASE_PATH__.replace(/\/$/, ''); // Remove trailing slash
const baseUrl = `${window.origin}${basePath}`;

export const SWClient = hc<SWClientTypes>(baseUrl);

// async function main() {
//   const res = await client.sw.upload.$post({
//     form: { file: new File(["Hello, world!"], "hello.txt", { type: "text/plain" }) },
//   });
//   console.log("Upload response:", await res.json());
// }
