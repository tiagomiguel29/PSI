import { Website } from './Website';

export type Page = {
  _id: string;
  website: Website;
  url: string;
  status: string;
  lastEvaluated: string;
};
