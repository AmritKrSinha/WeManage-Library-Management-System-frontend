import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private baseUrl = 'http://localhost:8080/api/books';
  private username = 'user';
  private password = '71747790-02d8-4824-8174-f88d0a63903c';

  constructor(private http: HttpClient) {}

  //for Basic Auth + JSON header
  private getAuthHeaders() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa(this.username + ':' + this.password),
    });
    return { headers, withCredentials: true };
  }

  // GET all books
  getAllBooks(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, this.getAuthHeaders());
  }

  // GET single book by ID
  getBookById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }

  // ADD book
 addBook(book: any): Observable<any> {
  const payload = {
    bookName: book.bookName,
    author: book.author,
    publisher: book.publisher,
    genre: book.genre
  };

  const options = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
    }),
    withCredentials: true
  };

  // Stringify payload to ensure Spring sees JSON
  return this.http.post<any>(this.baseUrl, JSON.stringify(payload), options);
}

  //  UPDATE book
  updateBook(book: any): Observable<any> {
    const options = this.getAuthHeaders();
    return this.http.put<any>(
      `${this.baseUrl}/${book.bookId}`,
      JSON.stringify(book),
      options
    );
  }

  // DELETE book
  deleteBook(id: number): Observable<string> {
  const options = {
    headers: new HttpHeaders({
      Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
    }),
    withCredentials: true,
    responseType: 'text' as const // ✅ 'as const' ensures TypeScript infers literal type
  };

  return this.http.delete(`${this.baseUrl}/${id}`, options);
}

}
