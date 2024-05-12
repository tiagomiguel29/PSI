import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { response } from 'express';
import { Page } from 'src/types/Page';

export interface PageResponse {
  success: boolean;
  page: Page;
  message?: string;
  errors?: Error[];
}

export interface PageListResponse {
  success: boolean;
  pages: Page[];
  totalWebsitePages: number;
  totalPages: number;
  currentPage: number;
}

export interface PageData {
  url: string;
  websiteId: string;
}

export interface StandardResponse {
  success: boolean;
  message?: string;
  errors?: Error[];
}

@Injectable({
  providedIn: 'root',
})
export class PagesService {
  private baseUrl = environment.apiUrl + '/api/pages'; // Base URL for API

  constructor(private http: HttpClient) {}

  createPage(pageData: PageData): Observable<PageResponse> {
    return this.http
      .post<PageResponse>(`${this.baseUrl}/new`, pageData)
      .pipe(map(response => response));
  }

  getPage(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`).pipe(
      catchError((error: any) => {
        throw 'Error in fetching page: ' + error;
      })
    );
  }

  getPages(
    websiteId?: string,
    page = 1,
    limit = 5,
    sort = 'createdAt',
    sortDirection = 'desc',
    status = 'all'
  ): Observable<PageListResponse> {
    let statusQuery = status === 'all' ? '' : `&status=${status}`;
    let queryParams =
      `?page=${page}&limit=${limit}&sort=${sort}&sortDirection=${sortDirection}` +
      statusQuery;
    if (websiteId) queryParams += `&websiteId=${websiteId}`;
    return this.http
      .get<PageListResponse>(`${this.baseUrl}${queryParams}`)
      .pipe(map(response => response));
  }

  removePage(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError((error: any) => {
        throw 'Error in deleting page: ' + error;
      })
    );
  }

  removePages(ids: string[], websiteId: string): Observable<StandardResponse> {
    return this.http
      .delete<StandardResponse>(`${this.baseUrl}?websiteId=${websiteId}`, {
        body: { ids },
      })
      .pipe(map(response => response));
  }
}
