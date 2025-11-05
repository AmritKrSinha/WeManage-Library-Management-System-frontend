import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FineService } from '../../services/fines';
import { BorrowService } from '../../services/borrow';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';


@Component({
  selector: 'app-fines',
  templateUrl: './fines.html',
  styleUrls: ['./fines.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
})
export class FinesComponent implements OnInit {
  fines: any[] = [];
  filteredFines: any[] = [];
  borrows: any[] = [];
  searchText: string = '';

  showAddPopup = false;
  showUpdatePopup = false;
  showDeletePopup = false;
  showViewPopup = false;

  currentFine: any = {
    fineId: 0,
    borrowId: null,
    perDayFine: 0,
    extraCharges: 0,
    amount: 0,
    paid: false,
    borrow: null
  };
  selectedFine: any = null;

  constructor(
    private fineService: FineService,
    private borrowService: BorrowService,
    private authService: AuthService, 
      private router: Router  
  ) {}

  ngOnInit(): void {
    this.loadBorrowsAndFines();
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadBorrowsAndFines() {
    this.borrowService.getAllBorrows().subscribe(borrows => {
      this.borrows = borrows.filter(b => b.borrowStatus === 'Overdue');

      // Prepare display fields for dropdown
      this.borrows = this.borrows.map(b => ({
        ...b,
        userName: b.userName || 'Unknown User',
        bookCopyDisplay: b.bookName ? `${b.bookName} - Copy ${b.bookCopyId}` : 'Unknown Book'
      }));

      this.loadFines();
    });
  }

  loadFines() {
    this.fineService.getAllFines().subscribe((data: any[]) => {
      this.fines = data.map(fine => {
        const borrow = this.borrows.find(b => b.borrowId === fine.borrow.borrowId);
        return {
          ...fine,
          userDisplay: borrow
            ? `${borrow.userName} - ${borrow.bookCopyDisplay}`
            : 'N/A',
          perDayFine: fine.perDayFine || 0,
          extraCharges: fine.extraCharges || 0
        };
      });
      this.filteredFines = [...this.fines];
    });
  }

  searchFines() {
    const term = this.searchText.toLowerCase();
    this.filteredFines = this.fines.filter(f =>
      f.userDisplay?.toLowerCase().includes(term)
    );
  }

  calculateFine() {
    const borrow = this.currentFine.borrow || this.borrows.find(b => b.borrowId === this.currentFine.borrowId);
    if (!borrow || !borrow.dueDate) {
      this.currentFine.amount = this.currentFine.extraCharges || 0;
      return;
    }

    const due = new Date(borrow.dueDate);
    const returned = borrow.returnDate ? new Date(borrow.returnDate) : new Date();
    const diffDays = Math.ceil((returned.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

    let totalFine = 0;
    if (diffDays > 0) totalFine += diffDays * (this.currentFine.perDayFine || 0);
    totalFine += this.currentFine.extraCharges || 0;

    this.currentFine.amount = totalFine;
  }

  onBorrowChange(borrowId: any) {
    const borrow = this.borrows.find(b => b.borrowId === borrowId);
    this.currentFine.borrow = borrow;
    this.calculateFine();
  }

  openAddPopup() {
    this.currentFine = {
      fineId: 0,
      borrowId: null,
      perDayFine: 0,
      extraCharges: 0,
      amount: 0,
      paid: false,
      borrow: null
    };
    this.showAddPopup = true;
  }

  closeAddPopup() {
    this.showAddPopup = false;
    this.currentFine = {} as any;
  }

  saveNewFine() {
    if (!this.currentFine.borrowId) return;

    const fineToSave = {
      borrowId: this.currentFine.borrowId,
      perDayFine: this.currentFine.perDayFine,
      extraCharges: this.currentFine.extraCharges,
      amount: this.currentFine.amount,
      paidStatus: this.currentFine.paid ? 'PAID' : 'UNPAID',
      paidDate: this.currentFine.paid ? new Date().toISOString() : null
    };

    this.fineService.addFine(fineToSave).subscribe({
      next: () => {
        this.showAddPopup = false;
        this.loadBorrowsAndFines();
      },
      error: err => console.error('Error saving fine:', err)
    });
  }

  openUpdatePopup(fine: any) {
    const borrow = this.borrows.find(b => b.borrowId === fine.borrow.borrowId);

    this.currentFine = {
      fineId: fine.fineId,
      borrowId: fine.borrow.borrowId,
      perDayFine: fine.perDayFine || 0,
      extraCharges: fine.extraCharges || 0,
      amount: fine.amount || 0,
      paid: fine.paidStatus === 'PAID',
      borrow
    };

    this.showUpdatePopup = true;
  }

  closeUpdatePopup() {
    this.showUpdatePopup = false;
    this.currentFine = {} as any;
  }

  saveUpdatedFine() {
    if (!this.currentFine.borrowId || !this.currentFine.fineId) return;

    const fineToUpdate = {
      borrowId: this.currentFine.borrowId,
      perDayFine: this.currentFine.perDayFine,
      extraCharges: this.currentFine.extraCharges,
      amount: this.currentFine.amount,
      paidStatus: this.currentFine.paid ? 'PAID' : 'UNPAID',
      paidDate: this.currentFine.paid ? new Date().toISOString() : null
    };

    this.fineService.updateFine(this.currentFine.fineId, fineToUpdate).subscribe({
      next: () => {
        const index = this.fines.findIndex(f => f.fineId === this.currentFine.fineId);
        if (index !== -1) {
          const borrow = this.borrows.find(b => b.borrowId === this.currentFine.borrowId);
          this.fines[index] = {
            ...fineToUpdate,
            fineId: this.currentFine.fineId,
            userDisplay: borrow ? `${borrow.userName} - ${borrow.bookCopyDisplay}` : 'N/A'
          };
        }
        this.filteredFines = [...this.fines];
        this.showUpdatePopup = false;
        this.currentFine = {} as any;
      },
      error: err => console.error('Error updating fine:', err)
    });
  }

  openDeletePopup(fine: any) {
    this.selectedFine = { ...fine };
    this.showDeletePopup = true;
  }

  closeDeletePopup() {
    this.selectedFine = null;
    this.showDeletePopup = false;
  }

  confirmDeleteFine() {
    if (this.selectedFine?.fineId != null) {
      this.fineService.deleteFine(this.selectedFine.fineId).subscribe(() => {
        this.fines = this.fines.filter(f => f.fineId !== this.selectedFine.fineId);
        this.filteredFines = [...this.fines];
        this.showDeletePopup = false;
        this.selectedFine = null;
      });
    }
  }

  openViewPopup(fine: any) {
    this.selectedFine = fine;
    this.showViewPopup = true;
  }

  closeViewPopup() {
    this.showViewPopup = false;
    this.selectedFine = null;
  }
}
