import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8080/users'; 

  // Spring Boot username and password
  private username = 'user';
  private password = '71747790-02d8-4824-8174-f88d0a63903c';

  constructor(private http: HttpClient) {}

  // Function to generate Authorization headers for Basic Authentication
  private getAuthHeaders() {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(this.username + ':' + this.password),
      'Content-Type': 'application/json'
    });
    return { headers, withCredentials: true }; 
  }

  // GET all users
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, this.getAuthHeaders());
  }

  // GET single user by ID
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }

  // POST new user
  addUser(user: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, user, this.getAuthHeaders());
  }

  // PUT update user
  updateUser(user: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${user.memberId}`, user, this.getAuthHeaders());
  }

  // DELETE user by ID
// UserService
deleteUser(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/${id}`, {
    ...this.getAuthHeaders(),
    responseType: 'text' 
  });
}


}
