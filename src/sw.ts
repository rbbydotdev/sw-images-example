/// <reference lib="webworker" />

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { handle } from "hono/service-worker";
import { z } from "zod";
const app = new Hono().basePath("/sw");

declare const self: ServiceWorkerGlobalScope;

function handleImageUpload(filePath: string, data: ArrayBuffer): Promise<string> {
  return Promise.resolve(`/images/${filePath}`);
}
function handleGetImages(): Promise<string[]> {
  const fakeImages = Array.from({ length: 12 }, (_, i) => `https://picsum.photos/seed/${i + 1}/400/300`);
  return Promise.resolve(fakeImages);
}

app.use("*", async (c, next) => {
  const request = c.req.raw;
  console.log(
    `${c.req.method} ${c.req.url} | Mode: ${request.mode} | Destination: ${request.destination} | Referrer: ${request.referrer}`,
  );
  await next();
});
const SWHandlers = {
  Hello: app.get("/hello", (c) => c.text("Hello World")),
  Images: app.get("/images", async (c) => {
    const fakeImages = Array.from({ length: 12 }, (_, i) => `https://picsum.photos/seed/${i + 1}/400/300`);
    return c.json(fakeImages);
  }),
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

// Service Worker Event Handlers
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(self.skipWaiting());
});

export type SWClientTypes = (typeof SWHandlers)[keyof typeof SWHandlers];
// Custom logging for service worker specific info
self.addEventListener("fetch", handle(app));
