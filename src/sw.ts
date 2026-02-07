import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { fire } from "hono/service-worker";
import { z } from "zod";
const app = new Hono().basePath("/sw");

function handleImageUpload(filePath: string, data: ArrayBuffer): Promise<string> {
  return Promise.resolve(`/images/${filePath}`);
}

const SWHandlers = {
  Hello: app.get("/hello", (c) => c.text("Hello World")),
  Upload: app.post(
    "/upload",
    zValidator(
      "form",
      z.object({
        file: z.instanceof(File),
      }),
    ),
    async (c) => {
      try {
        const { file } = c.req.valid("form");
        const arrayBuffer = await file.arrayBuffer();
        return c.json({ path: await handleImageUpload(file.name, arrayBuffer) });
      } catch (error) {
        throw error;
      }
    },
  ),
};

fire(app);

export type SWClientTypes = (typeof SWHandlers)[keyof typeof SWHandlers];
