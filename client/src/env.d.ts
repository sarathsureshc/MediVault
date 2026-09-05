declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    // Add other environment variables here as needed
    NODE_ENV: "development" | "production" | "test";
  }
}
