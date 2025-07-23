import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { join } from "path";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(), 
    tsconfigPaths()
  ],
  
  // Production-specific configurations
  build: {
    outDir: "dist", // Vercel expects this by default
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          reactRouter: ["react-router-dom"],
        }
      }
    }
  },
  
  // Base path configuration (critical for Vercel)
  base: "/",
  
  // Resolve aliases (matches your project structure)
  resolve: {
    alias: {
      "@": join(__dirname, "app"),
      "~": join(__dirname, "public")
    }
  },
  
  // Preview server configuration (for local testing)
  preview: {
    port: 5173,
    strictPort: true
  }
});