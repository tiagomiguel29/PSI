import { Website } from './Website';

export type Page = {
  website: Website;
  url: string;
  status: string;
  lastEvaluated: string;
};
