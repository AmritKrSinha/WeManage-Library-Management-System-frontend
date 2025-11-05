import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Correct payload matching backend
export interface BorrowPayload {
  userId: number;
  bookCopyId: number;
  issueDate?: string;
  dueDate?: string;
  returnDate?: string;
  borrowStatus?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BorrowService {
  private baseUrl = 'http://localhost:8080/borrows';
  private bookCopyUrl = 'http://localhost:8080/api/bookMasters';
  private username = 'user';
  private password = '71747790-02d8-4824-8174-f88d0a63903c';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa(this.username + ':' + this.password),
    });
    return { headers, withCredentials: true };
  }

  // --- Borrows ---
  getAllBorrows(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, this.getAuthHeaders());
  }

  addBorrow(borrow: BorrowPayload): Observable<any> {
    return this.http.post<any>(this.baseUrl, borrow, this.getAuthHeaders());
  }

  updateBorrow(borrowId: number, borrow: BorrowPayload): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${borrowId}`, borrow, this.getAuthHeaders());
  }

  deleteBorrow(borrowId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${borrowId}`, this.getAuthHeaders());
  }

  // --- Book Copies ---
  getBookCopies(): Observable<any[]> {
    return this.http.get<any[]>(this.bookCopyUrl, this.getAuthHeaders());
  }
}
