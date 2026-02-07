/// <reference lib="webworker" />

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { handle } from "hono/service-worker";
import { del, get, keys, set } from "idb-keyval";
import { z } from "zod";

const app = new Hono().basePath("/sw");

declare const self: ServiceWorkerGlobalScope;

async function convertToWebP(arrayBuffer: ArrayBuffer, fileName: string): Promise<ArrayBuffer> {
  // Check if the file is PNG or JPG
  const fileExt = fileName.toLowerCase();
  const shouldConvert = fileExt.endsWith(".png") || fileExt.endsWith(".jpg") || fileExt.endsWith(".jpeg");

  if (!shouldConvert) {
    // Return original data for non-convertible formats
    return arrayBuffer;
  }

  try {
    // Create a blob from the array buffer
    const blob = new Blob([arrayBuffer]);

    // Create an ImageBitmap from the blob
    const imageBitmap = await createImageBitmap(blob);

    // Create an OffscreenCanvas with the same dimensions
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }

    // Draw the image onto the canvas
    ctx.drawImage(imageBitmap, 0, 0);

    // Convert to WebP with quality 0.9
    const webpBlob = await canvas.convertToBlob({
      type: "image/webp",
      quality: 0.9,
    });

    // Convert blob back to ArrayBuffer
    return await webpBlob.arrayBuffer();
  } catch (error) {
    console.error("Failed to convert image to WebP:", error);
    // Return original data if conversion fails
    return arrayBuffer;
  }
}

async function handleImageUpload(filePath: string, data: ArrayBuffer): Promise<string> {
  // Generate a unique ID for the image (use .webp extension)
  const baseFileName = filePath.replace(/\.(png|jpg|jpeg|gif|webp)$/i, "");
  const id = `${Date.now()}-${baseFileName}.webp`;

  // Convert PNG/JPG to WebP
  const webpData = await convertToWebP(data, filePath);

  // Store the converted image data in IndexedDB
  await set(id, webpData);

  // Return the path to access this image
  return `/sw/image/${id}`;
}

async function handleGetImages(): Promise<string[]> {
  // Get all keys from IndexedDB
  const imageKeys = await keys();

  // Return URLs pointing to each image
  return imageKeys.map((key) => `/sw/image/${key}`);
}

app.use("*", async (c, next) => {
  const request = c.req.raw;
  console.log(
    `${c.req.method} ${c.req.url} | Mode: ${request.mode} | Destination: ${request.destination} | Referrer: ${request.referrer}`,
  );
  await next();
});
const IMAGE_CACHE_NAME = "image-cache-v1";

const SWHandlers = {
  Image: app.get("/image/:id", async (c) => {
    const { id } = c.req.param();
    const requestUrl = c.req.url;

    // Try to get from Cache API first
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(requestUrl);

    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, retrieve from IndexedDB
    const imageData = await get(id);

    if (!imageData) {
      return c.json({ error: "Image not found" }, 404);
    }

    // Determine the content type from the filename
    let contentType = "image/webp";
    if (id.endsWith(".gif")) contentType = "image/gif";
    // Most images will be WebP after conversion

    // Create response with image data
    const response = new Response(imageData as ArrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });

    // Store in cache for future requests
    await cache.put(requestUrl, response.clone());

    return response;
  }),
  Images: app.get("/images", async (c) => {
    const images = await handleGetImages();
    return c.json(images);
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
        const path = await handleImageUpload(file.name, arrayBuffer);
        return c.json({ path });
      } catch (error) {
        throw error;
      }
    },
  ),
  Delete: app.delete("/image/:id", async (c) => {
    const { id } = c.req.param();

    // Check if the image exists
    const imageData = await get(id);

    if (!imageData) {
      return c.json({ error: "Image not found" }, 404);
    }

    // Delete the image from IndexedDB
    await del(id);

    // Try to delete from Cache API
    try {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      const imageUrl = new URL(`/sw/image/${id}`, c.req.url).href;
      await cache.delete(imageUrl);
    } catch (error) {
      console.error("Failed to delete from cache:", error);
      // Continue even if cache deletion fails
    }

    return c.json({ success: true, message: "Image deleted" });
  }),
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
