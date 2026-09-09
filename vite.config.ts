import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/payment": {
        target: "http://localhost:5200",
        changeOrigin: true,
        secure: false,
      },
      "/api/v1/Plans": {
        target: "http://localhost:5200",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "https://admin-staging-api.catspeak.com.vn",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
