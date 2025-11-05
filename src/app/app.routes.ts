import { Routes } from '@angular/router';
import { UsersComponent  } from './components/users/users';
import { BooksComponent } from './components/books/books';
import { BookCopiesComponent } from './components/book-copies/book-copies';
import { BorrowsComponent } from './components/borrows/borrows';
import { FinesComponent } from './components/fines/fines';
import { LoginComponent } from './components/login/login';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Protected Routes
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'books', component: BooksComponent, canActivate: [AuthGuard] },
  { path: 'book-copies', component: BookCopiesComponent, canActivate: [AuthGuard] },
  { path: 'borrows', component: BorrowsComponent, canActivate: [AuthGuard] },
  { path: 'fines', component: FinesComponent, canActivate: [AuthGuard] },

  // Default Route
  { path: '', redirectTo: '/users', pathMatch: 'full' },

  // Wildcard Route
  { path: '**', redirectTo: '/users' }
];
