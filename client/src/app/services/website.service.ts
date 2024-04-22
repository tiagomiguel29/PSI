import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Website } from 'src/types/Website';
import { Page } from 'src/types/Page';

import { environment } from 'src/environments/environment';

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
  pages: Page[];
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
          return { ...response.website, pages: response.pages };
        } else {
          throw new Error('Failed to load website');
        }
      })
    );
  }

  // Create a new website
  createWebsite(url: string, pages: string[]): Observable<Website> {
    return this.http
      .post<WebsiteResponse>(`${this.baseUrl}/new`, { url, pages })
      .pipe(
        map(response => {
          if (response.success) {
            return response.website;
          } else {
            throw new Error('Failed to create website');
          }
        })
      );
  }

  // Delete a website by ID
  deleteWebsite(id: string): Observable<any> {
    return this.http
      .delete<{ success: boolean; message?: string }>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.message || 'Website deleted successfully';
          } else {
            throw new Error('Failed to delete website');
          }
        })
      );
  }
}
