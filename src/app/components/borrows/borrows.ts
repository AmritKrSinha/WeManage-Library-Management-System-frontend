import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BorrowService, BorrowPayload } from '../../services/borrow';
import { UserService } from '../../services/users';
import { BookCopiesService } from '../../services/book-copies';
import { RouterModule ,Router} from '@angular/router';
import { AuthService } from '../../services/auth';


export interface BorrowDTO {
  borrowId: number;
  userId?: number;
  memberId?: number;
  userName?: string;
  bookCopyId?: number;
  copyId?: number;
  bookName?: string;
  bookCopyDisplay?: string;
  issueDate?: string;
  dueDate?: string;
  returnDate?: string | undefined;
  borrowStatus?: string;
}

@Component({
  selector: 'app-borrows',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './borrows.html',
  styleUrls: ['./borrows.scss']
})
export class BorrowsComponent implements OnInit {

  borrows: BorrowDTO[] = [];
  filteredBorrows: BorrowDTO[] = [];
  members: any[] = [];
  bookCopies: any[] = [];
  searchText: string = '';

  private userMap = new Map<number, string>();
  private copyMap = new Map<number, { bookName?: string; copyId?: number }>();

  currentBorrow: BorrowDTO = {} as BorrowDTO;
  selectedBorrow: BorrowDTO | null = null;

  showAddPopup = false;
  showUpdatePopup = false;
  showDeletePopup = false;
  showViewPopup = false;

  constructor(
    private borrowService: BorrowService,
    private userService: UserService,
    private bookCopyService: BookCopiesService,
    private authService: AuthService, 
  private router: Router  
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.loadBookCopies();
    this.loadBorrows();
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /***** BORROWS *****/
  loadBorrows(): void {
    this.borrowService.getAllBorrows().subscribe({
      next: (data: BorrowDTO[]) => {
        this.borrows = (data || []).map(b => ({
          ...b,
          memberId: b.userId ?? b.memberId,
          copyId: b.bookCopyId ?? b.copyId
        }));
        this.applyDisplayMaps();
      },
      error: (err) => {
        console.error('Failed to fetch borrows', err);
        this.borrows = [];
        this.filteredBorrows = [];
      }
    });
  }

  /***** MEMBERS *****/
 /***** MEMBERS (USERS) *****/
loadMembers(): void {
  this.userService.getAllUsers().subscribe({
    next: (data: any[]) => {
      this.members = Array.isArray(data) ? data : [];
      this.userMap.clear();

      this.members.forEach(m => {
        const id = m.memberId ?? m.userId ?? m.id; // handle different backend fields
        const name = m.memberName ?? m.name ?? `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim();
        if (id != null) this.userMap.set(+id, name || 'Unknown');
      });

      // Update display names in borrows table
      this.applyDisplayMaps();
    },
    error: (err) => {
      console.error('Failed to fetch members', err);
      this.members = [];
    }
  });
}

  /***** BOOK COPIES *****/
  loadBookCopies(): void {
  this.bookCopyService.getBookCopies().subscribe({
    next: (data: any[]) => {
      this.bookCopies = (Array.isArray(data) ? data : []).map(c => ({
        copyId: c.copyId,
        bookName: c.book?.bookName ?? 'Unknown'
      }));

      // Build lookup map
      this.copyMap.clear();
      this.bookCopies.forEach(c => {
        if (c.copyId != null) this.copyMap.set(c.copyId, { bookName: c.bookName, copyId: c.copyId });
      });

      // Update display names in borrows table
      this.applyDisplayMaps();
    },
    error: (err) => {
      console.error('Failed to fetch book copies', err);
      this.bookCopies = [];
    }
  });
}

  /***** DISPLAY MAPS *****/
  private applyDisplayMaps(): void {
  this.borrows = this.borrows.map(b => {
    // Map member/user name
    const uid = b.userId ?? b.memberId;
    const userName = uid != null ? this.userMap.get(uid) ?? 'Unknown' : 'Unknown';

    // Map book copy display
    const cId = b.bookCopyId ?? b.copyId;
    const copyInfo = cId != null ? this.copyMap.get(cId) : undefined;
    const bookCopyDisplay = copyInfo
      ? `${copyInfo.bookName} - Copy ${copyInfo.copyId}`
      : 'Unknown';

    return {
      ...b,
      userName,
      bookCopyDisplay,
      memberId: b.memberId ?? b.userId,
      copyId: b.copyId ?? b.bookCopyId
    } as BorrowDTO;
  });

  this.filteredBorrows = [...this.borrows];
}

  /***** SEARCH *****/
  searchBorrows(): void {
    const text = (this.searchText || '').toLowerCase().trim();
    this.filteredBorrows = text
      ? this.borrows.filter(b =>
          (b.userName?.toLowerCase().includes(text) ?? false) ||
          (b.bookCopyDisplay?.toLowerCase().includes(text) ?? false) ||
          (b.borrowId?.toString().includes(text) ?? false)
        )
      : [...this.borrows];
  }

  formatDate(date?: string | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
  }

  /***** POPUPS *****/
  openAddPopup(): void {
    this.currentBorrow = {
      borrowId: 0,
      memberId: undefined,
      copyId: undefined,
      issueDate: '',
      dueDate: '',
      returnDate: undefined,
      borrowStatus: 'Issued'
    };
    this.showAddPopup = true;
  }

  closeAddPopup(): void { this.showAddPopup = false; this.currentBorrow = {} as BorrowDTO; }

  openUpdatePopup(borrow: BorrowDTO): void {
    this.currentBorrow = { ...borrow };
    this.showUpdatePopup = true;
  }

  closeUpdatePopup(): void { this.showUpdatePopup = false; this.currentBorrow = {} as BorrowDTO; }

  openDeletePopup(borrow: BorrowDTO): void { this.selectedBorrow = borrow; this.showDeletePopup = true; }
  closeDeletePopup(): void { this.selectedBorrow = null; this.showDeletePopup = false; }

  openViewPopup(borrow: BorrowDTO): void { this.selectedBorrow = borrow; this.showViewPopup = true; }
  closeViewPopup(): void { this.selectedBorrow = null; this.showViewPopup = false; }

  /***** CRUD *****/
  saveNewBorrow(): void {
    if (!this.currentBorrow.memberId || !this.currentBorrow.copyId) return alert('Please select member and book copy.');

    const payload: BorrowPayload = {
      userId: +this.currentBorrow.memberId!,
      bookCopyId: +this.currentBorrow.copyId!,
      issueDate: this.currentBorrow.issueDate,
      dueDate: this.currentBorrow.dueDate,
      returnDate: this.currentBorrow.returnDate,
      borrowStatus: this.currentBorrow.borrowStatus
    };

    this.borrowService.addBorrow(payload).subscribe({
      next: () => { this.loadBorrows(); this.closeAddPopup(); },
      error: (err) => { console.error(err); alert('Failed to add borrow'); }
    });
  }

  saveUpdatedBorrow(): void {
    if (!this.currentBorrow.borrowId) return alert('Invalid borrow to update.');

    const payload: BorrowPayload = {
      userId: +this.currentBorrow.memberId!,
      bookCopyId: +this.currentBorrow.copyId!,
      issueDate: this.currentBorrow.issueDate,
      dueDate: this.currentBorrow.dueDate,
      returnDate: this.currentBorrow.returnDate,
      borrowStatus: this.currentBorrow.borrowStatus
    };

    this.borrowService.updateBorrow(this.currentBorrow.borrowId, payload).subscribe({
      next: () => { this.loadBorrows(); this.closeUpdatePopup(); },
      error: (err) => { console.error(err); alert('Failed to update borrow'); }
    });
  }

  confirmDeleteBorrow(): void {
    const id = this.selectedBorrow?.borrowId;
    if (!id) return;

    this.borrowService.deleteBorrow(id).subscribe({
      next: () => { 
        this.borrows = this.borrows.filter(b => b.borrowId !== id);
        this.filteredBorrows = this.filteredBorrows.filter(b => b.borrowId !== id);
        this.closeDeletePopup();
      },
      error: (err) => { console.error(err); alert('Failed to delete borrow'); }
    });
  }
}
