import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AuthInterceptor } from './app/auth-interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),      
    provideRouter(routes),    
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true               
    }
  ]
}).catch(err => console.error(err));
