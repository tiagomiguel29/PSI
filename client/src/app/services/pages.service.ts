import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Page {
  url: string;
  websiteId: string;
  _id?: string; // Optional, included when fetching or deleting
}

@Injectable({
  providedIn: 'root',
})
export class PagesService {
  private baseUrl = environment.apiUrl + '/api/pages'; // Base URL for API

  constructor(private http: HttpClient) {}

  createPage(pageData: Page): Observable<any> {
    return this.http.post(`${this.baseUrl}/new`, pageData).pipe(
      catchError((error: any) => {
        throw 'Error in creating page: ' + error;
      })
    );
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
    page?: number,
    limit?: number,
    sort?: string,
    sortDirection?: string
  ): Observable<any> {
    let queryParams = `?page=${page}&limit=${limit}&sort=${sort}&sortDirection=${sortDirection}`;
    if (websiteId) queryParams += `&websiteId=${websiteId}`;
    return this.http.get(`${this.baseUrl}${queryParams}`).pipe(
      catchError((error: any) => {
        throw 'Error in fetching pages: ' + error;
      })
    );
  }

  removePage(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError((error: any) => {
        throw 'Error in deleting page: ' + error;
      })
    );
  }
}
