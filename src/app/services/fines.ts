import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FineDTO {
  borrowId: number;
  amount: number;
  paidStatus: string;
  paidDate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FineService {

  private baseUrl = 'http://localhost:8080/fines';
  private username = 'user';
  private password = '71747790-02d8-4824-8174-f88d0a63903c';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const auth = btoa(`${this.username}:${this.password}`);
    return new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    });
  }

  getAllFines(): Observable<FineDTO[]> {
    return this.http.get<FineDTO[]>(this.baseUrl, { headers: this.getAuthHeaders(), withCredentials: true });
  }

  getFineById(id: number): Observable<FineDTO> {
    return this.http.get<FineDTO>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders(), withCredentials: true });
  }

  addFine(fine: FineDTO): Observable<FineDTO> {
    return this.http.post<FineDTO>(this.baseUrl, fine, { headers: this.getAuthHeaders(), withCredentials: true });
  }

  updateFine(id: number, fine: FineDTO): Observable<FineDTO> {
    return this.http.put<FineDTO>(`${this.baseUrl}/${id}`, fine, { headers: this.getAuthHeaders(), withCredentials: true });
  }

  deleteFine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders(), withCredentials: true });
  }
}
