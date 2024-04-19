import { Page } from "./Page";

export type Website = {
  url: string;
  createdAt: string;
  status: string;
  lastEvaluated: string;
  pages: Page[];
};
