import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private username = 'user';
  private password = '727f71bf-8581-4155-ae65-a9524f743a9c';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth = btoa(`${this.username}:${this.password}`);
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    return next.handle(authReq);
  }
}
