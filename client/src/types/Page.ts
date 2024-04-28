import { Website } from './Website';

export type Page = {
  _id: string;
  website: Website;
  websiteId: string;
  url: string;
  status: string;
  lastEvaluated: string;
};
