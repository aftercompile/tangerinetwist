"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: "#1B1815",
          color: "#FBF8F3",
          border: "1px solid #2A2521",
          borderRadius: "9999px",
          fontSize: "13px",
          padding: "10px 20px",
        },
      }}
    />
  );
}
