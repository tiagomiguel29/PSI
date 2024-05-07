import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Website } from 'src/types/Website';
import { Page } from 'src/types/Page';

import { environment } from 'src/environments/environment';

interface StandardResponse {
  success: boolean;
  message?: string;
}

interface WebsiteListResponse {
  success: boolean;
  websites: Website[];
  totalWebsites: number;
  totalPages: number;
  currentPage: number;
}

interface WebsiteResponse {
  success: boolean;
  website: Website;
  pages?: Page[];
  imageUrl?: string;
  message?: string;
  errors?: Error[];
}

interface Error {
  field: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebsiteService {
  private baseUrl = environment.apiUrl + '/api/websites'; // Base URL for API

  constructor(private http: HttpClient) {}

  // Get all websites
  getWebsites(
    page = 1,
    limit = 5,
    sort = 'createdAt',
    sortDirection = 'desc',
    status = 'all'
  ): Observable<WebsiteListResponse> {
    const statusQuery = status === 'all' ? '' : `&status=${status}`;
    return this.http
      .get<WebsiteListResponse>(
        `${this.baseUrl}?page=${page}&limit=${limit}&sort=${sort}&sortDirection=${sortDirection}${statusQuery}`
      )
      .pipe(
        map(response => {
          if (response.success) {
            return response;
          } else {
            throw new Error('Failed to load websites');
          }
        })
      );
  }

  // Get a single website by ID
  getWebsiteById(id: string): Observable<Website> {
    return this.http.get<WebsiteResponse>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (response.success) {
          return {
            ...response.website,
            pages: response.pages,
            imageUrl: response.imageUrl,
          };
        } else {
          throw new Error('Failed to load website');
        }
      })
    );
  }

  // Create a new website
  createWebsite(url: string): Observable<WebsiteResponse> {
    return this.http
      .post<WebsiteResponse>(`${this.baseUrl}/new`, { url })
      .pipe(map(response => response));
  }

  // Add pages to a website
  addPagesToWebsite(id: string, pages: string[]): Observable<WebsiteResponse> {
    return this.http
      .post<WebsiteResponse>(`${this.baseUrl}/${id}/addPages`, { pages })
      .pipe(map(response => response));
  }

  // Delete a website by ID
  deleteWebsite(id: string): Observable<StandardResponse> {
    return this.http
      .delete<StandardResponse>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response));
  }

  // Evaluate a website pages
  evaluate(id: string, pages: string[]): Observable<WebsiteResponse> {
    return this.http
      .post<WebsiteResponse>(`${this.baseUrl}/${id}/evaluate`, { pages })
      .pipe(map(response => response));
  }
}
