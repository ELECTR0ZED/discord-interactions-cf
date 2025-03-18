// env.d.ts
export {};

declare global {
  interface Env {
    PUBLIC_KEY: string;
    TOKEN: string;
    CLIENT_ID: string;
    [key: string]: unknown; // Allow any additional user-defined bindings
  }
}
