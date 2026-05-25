import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During `npm run dev`, Vercel's serverless functions aren't running, so we
// can't hit /api locally without `vercel dev`. If you use `vercel dev`
// (recommended), it serves both the frontend and the /api function together
// on one port and no proxy is needed. This config is the plain `vite` setup.
export default defineConfig({
  plugins: [react()],
});
