import { Page } from "./Page";

export type Website = {
  _id?: string;
  url?: string;
  createdAt?: string;
  status?: string;
  lastEvaluated?: string;
  pages?: Page[];
};
