import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookCopiesService } from '../../services/book-copies';
import { BookService } from '../../services/books';
import { AuthService } from '../../services/auth';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-book-copies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,RouterModule],
  templateUrl: './book-copies.html',
  styleUrls: ['./book-copies.scss']
})
export class BookCopiesComponent implements OnInit {
  bookCopies: any[] = [];
  filteredCopies: any[] = [];
  books: any[] = [];
  searchText: string = '';

  newCopy: any = { bookId: '', purchaseDate: '', copyStatus: 'Available' };
  selectedCopy: any = null;

  showAddPopup = false;
  showUpdatePopup = false;
  showDeletePopup = false;
  showViewPopup = false;

  constructor(
    private bookCopiesService: BookCopiesService,
    private booksService: BookService,
    private authService: AuthService, 
  private router: Router  
  ) {}

  ngOnInit(): void {
    this.getAllBookCopies();
    this.getAllBooks();
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getAllBookCopies(): void {
    this.bookCopiesService.getBookCopies().subscribe({
      next: data => {
        this.bookCopies = data;
        this.filteredCopies = [...data];
      },
      error: err => alert('Failed to fetch book copies')
    });
  }

  getAllBooks(): void {
    this.booksService.getAllBooks().subscribe({
      next: data => this.books = data,
      error: err => console.error(err)
    });
  }

  searchCopies(): void {
    const text = this.searchText.toLowerCase();
    this.filteredCopies = this.bookCopies.filter(copy =>
      copy.book.bookName.toLowerCase().includes(text) ||
      copy.copyStatus.toLowerCase().includes(text) ||
      copy.copyId.toString().includes(text)
    );
  }

  // --- Add Copy ---
  openAddPopup(): void {
    this.showAddPopup = true;
    this.newCopy = { bookId: '', purchaseDate: '', copyStatus: 'Available' };
  }

  closeAddPopup(): void {
    this.showAddPopup = false;
  }

  saveNewCopy(): void {
    if (!this.newCopy.bookId) {
      alert('Please select a book');
      return;
    }

    const payload = {
      bookId: this.newCopy.bookId,
      purchaseDate: this.newCopy.purchaseDate,
      copyStatus: this.newCopy.copyStatus
    };

    this.bookCopiesService.addBookCopy(payload).subscribe({
      next: () => {
        this.getAllBookCopies();
        this.closeAddPopup();
      },
      error: err => alert('Failed to add book copy')
    });
  }

  // --- Update Copy ---
  openUpdatePopup(copy: any): void {
    this.selectedCopy = {
      copyId: copy.copyId,
      bookId: copy.book.bookId,
      purchaseDate: copy.purchaseDate,
      copyStatus: copy.copyStatus
    };
    this.showUpdatePopup = true;
  }

  closeUpdatePopup(): void {
    this.showUpdatePopup = false;
    this.selectedCopy = null;
  }

  saveUpdatedCopy(): void {
    if (!this.selectedCopy || !this.selectedCopy.copyId) return;

    const payload = {
      bookId: this.selectedCopy.bookId,
      purchaseDate: this.selectedCopy.purchaseDate,
      copyStatus: this.selectedCopy.copyStatus
    };

    this.bookCopiesService.updateBookCopy(this.selectedCopy.copyId, payload).subscribe({
      next: () => {
        this.getAllBookCopies();
        this.closeUpdatePopup();
      },
      error: err => alert('Failed to update book copy')
    });
  }

  // --- Delete Copy ---
  openDeletePopup(copy: any): void {
    this.selectedCopy = copy;
    this.showDeletePopup = true;
  }

  closeDeletePopup(): void {
    this.showDeletePopup = false;
    this.selectedCopy = null;
  }

  confirmDeleteCopy(): void {
  if (!this.selectedCopy || !this.selectedCopy.copyId) return;

  this.bookCopiesService.deleteBookCopy(this.selectedCopy.copyId).subscribe({
    next: (res) => {
      // Remove from local arrays immediately
      this.bookCopies = this.bookCopies.filter(c => c.copyId !== this.selectedCopy.copyId);
      this.filteredCopies = this.filteredCopies.filter(c => c.copyId !== this.selectedCopy.copyId);
      this.closeDeletePopup();
    },
    error: err => console.error('Failed but copy may have been deleted', err)
  });
}


  // --- View Copy ---
  openViewPopup(copy: any): void {
    this.selectedCopy = copy;
    this.showViewPopup = true;
  }

  closeViewPopup(): void {
    this.showViewPopup = false;
    this.selectedCopy = null;
  }
}
