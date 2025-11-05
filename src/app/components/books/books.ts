import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookService } from '../../services/books';
import { AuthService } from '../../services/auth';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-books',
  standalone: true,
  templateUrl: './books.html',
  styleUrls: ['./books.scss'],
  imports: [CommonModule, FormsModule, RouterLink,RouterModule],
})
export class BooksComponent implements OnInit {
  books: any[] = [];
  allBooks: any[] = [];
  searchText: string = '';
  genres: string[] = [
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'Thriller',
    'Education',
    'Biography/Autobiography',
    'Romance',
    'Poetry',
    'Historical',
    'Religious/Spiritual',
  ];

  showAddPopup = false;
  showEditPopup = false;
  showDeletePopup = false;
  showViewPopup = false;

  newBook = { bookName: '', author: '', publisher: '', genre: '' };
  selectedBook: any = {};

  constructor(private bookService: BookService,
    private authService: AuthService, 
    private router: Router  ) {}

  ngOnInit() {
    this.loadBooks();
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadBooks() {
    this.bookService.getAllBooks().subscribe({
      next: (data: any[]) => {
        this.books = data;
        this.allBooks = data;
      },
      error: (err: any) => console.error('Error fetching books:', err),
    });
  }

  searchBooks() {
    if (!this.searchText) {
      this.books = [...this.allBooks];
      return;
    }
    const lowerSearch = this.searchText.toLowerCase();
    this.books = this.allBooks.filter(
      (book) =>
        book.bookName.toLowerCase().includes(lowerSearch) ||
        book.author.toLowerCase().includes(lowerSearch) ||
        book.genre.toLowerCase().includes(lowerSearch) ||
        book.publisher.toLowerCase().includes(lowerSearch)
    );
  }

  // -------- ADD BOOK --------
  openAddPopup() {
    this.showAddPopup = true;
    this.newBook = { bookName: '', author: '', publisher: '', genre: '' };
  }
  closeAddPopup() {
    this.showAddPopup = false;
    this.newBook = { bookName: '', author: '', publisher: '', genre: '' };
  }

  saveNewBook() {
    if (!this.newBook.bookName || !this.newBook.author) {
      return alert('Please fill required fields!');
    }

    const payload = { ...this.newBook };

    this.bookService.addBook(payload).subscribe({
      next: () => {
        this.loadBooks();
        this.closeAddPopup();
        alert('Book added successfully!');
      },
      error: (err: any) => {
        console.error(err);
        alert('Error adding book.');
      },
    });
  }

  // -------- EDIT BOOK --------
  openEditPopup(book: any) {
    this.selectedBook = { ...book };
    this.showEditPopup = true;
  }
  closeEditPopup() {
    this.showEditPopup = false;
    this.selectedBook = {};
  }

  saveEditedBook() {
    if (!this.selectedBook.bookName || !this.selectedBook.author) {
      return alert('Please fill required fields!');
    }

    this.bookService.updateBook(this.selectedBook).subscribe({
      next: () => {
        this.loadBooks();
        this.closeEditPopup();
        alert('Book updated successfully!');
      },
      error: (err: any) => {
        console.error(err);
        alert('Error updating book.');
      },
    });
  }

  // -------- DELETE BOOK --------
  openDeletePopup(book: any) {
    this.selectedBook = { ...book };
    this.showDeletePopup = true;
  }
  closeDeletePopup() {
    this.showDeletePopup = false;
    this.selectedBook = {};
  }

  confirmDelete() {
    this.bookService.deleteBook(this.selectedBook.bookId).subscribe({
      next: () => {
        this.loadBooks();
        this.closeDeletePopup();
        alert('Book deleted successfully!');
      },
      error: (err: any) => {
        console.error(err);
        alert('Error deleting book.');
      },
    });
  }

  // -------- VIEW BOOK --------
  openViewPopup(book: any) {
    this.selectedBook = { ...book };
    this.showViewPopup = true;
  }
  closeViewPopup() {
    this.showViewPopup = false;
    this.selectedBook = {};
  }
}
