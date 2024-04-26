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
};
