import { Api } from "./preload";

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    api: Api;
  }
}

export {};
