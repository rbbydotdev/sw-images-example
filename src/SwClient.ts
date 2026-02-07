import { hc } from "hono/client";
import type { SWClientTypes } from "./sw";
export const SWClient = hc<SWClientTypes>(window.origin);

// async function main() {
//   const res = await client.sw.upload.$post({
//     form: { file: new File(["Hello, world!"], "hello.txt", { type: "text/plain" }) },
//   });
//   console.log("Upload response:", await res.json());
// }
