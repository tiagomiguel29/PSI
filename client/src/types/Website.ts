import { Page } from './Page';

export type Website = {
  _id?: string;
  url?: string;
  createdAt?: string;
  status?: string;
  previewImage?: string;
  previewImageStatus?: string;
  lastEvaluated?: string;
  pages?: Page[];
  imageUrl?: string;
  stats?: {
    pagesWithoutErrors: number;
    pagesWithErrors: number;
    pagesWithAError: number;
    pagesWithAAError: number;
    pagesWithAAAError: number;
    evaluatedPages: number;
    topErrors: {
      code: string;
      name: string;
      description: string;
      count: number;
    }[];
  }
};
