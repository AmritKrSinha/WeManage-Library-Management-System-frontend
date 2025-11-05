import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookCopiesService {
  private baseUrl = 'http://localhost:8080/api/bookMasters';
  private username = 'user';
  private password = '71747790-02d8-4824-8174-f88d0a63903c';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: 'Basic ' + btoa(this.username + ':' + this.password),
        'Content-Type': 'application/json'
      }),
      withCredentials: true
    };
  }

  getBookCopies(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, this.getAuthHeaders());
  }

  addBookCopy(copy: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, copy, this.getAuthHeaders());
  }

  updateBookCopy(id: number, copy: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, copy, this.getAuthHeaders());
  }

 deleteBookCopy(copyId: number) {
  return this.http.delete(
    `${this.baseUrl}/${copyId}`,
    {
      headers: new HttpHeaders({
        Authorization: 'Basic ' + btoa(this.username + ':' + this.password),
      }),
      withCredentials: true,
      responseType: 'text'  // treat backend text response correctly
    }
  );
}




}
