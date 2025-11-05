import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/users';
import { AuthService } from '../../services/auth';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
  imports: [CommonModule, RouterLink, FormsModule]
})
export class UsersComponent implements OnInit {

  users: any[] = [];
  allUsers: any[] = [];  // store all users for search/filtering
  searchText: string = ''; // binds to search input

  // Popups visibility
  showAddUserPopup = false;
  showUpdateUserPopup = false;
  showDeleteUserPopup = false;
  showViewUserPopup = false;

  // Form objects
  newUser: any = {
    name: '', email: '', address: '', role: '', contact: 0, userId: '', password: ''
  };
  selectedUser: any = {};

  constructor(
  private userService: UserService,
  private authService: AuthService, 
  private router: Router             
) {}

  ngOnInit() {
    this.loadUsers();
  }
   logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data) => { 
        this.users = data; 
        this.allUsers = data;  
      },
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  /** ---------------- SEARCH ---------------- */
  searchUsers() {
    if (!this.searchText) {
      this.users = [...this.allUsers]; // reset if empty
      return;
    }
    const lowerSearch = this.searchText.toLowerCase();
    this.users = this.allUsers.filter(user =>
      user.name.toLowerCase().includes(lowerSearch) ||
      user.email.toLowerCase().includes(lowerSearch) ||
      user.role.toLowerCase().includes(lowerSearch) ||
      user.userId.toLowerCase().includes(lowerSearch)
    );
  }

  /** ---------------- ADD USER ---------------- */
  openAddUserPopup() { this.showAddUserPopup = true; }
  closeAddUserPopup() { 
    this.showAddUserPopup = false; 
    this.resetNewUser(); 
  }
  resetNewUser() {
    this.newUser = { name: '', email: '', address: '', role: '', contact: 0, userId: '', password: '' };
  }
  saveNewUser() {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.userId || !this.newUser.password) {
      return alert('Please fill all required fields!');
    }

    // Remove memberId from payload (auto-generated in backend)
    const payload = { ...this.newUser };

    this.userService.addUser(payload).subscribe({
      next: () => { 
        this.loadUsers(); 
        this.closeAddUserPopup(); 
        alert('User added successfully'); 
      },
      error: (err) => { 
        console.error(err); 
        alert('Error adding user'); 
      }
    });
  }

  /** ---------------- UPDATE USER ---------------- */
  openUpdateUserPopup(user: any) { this.selectedUser = { ...user }; this.showUpdateUserPopup = true; }
  closeUpdateUserPopup() { this.showUpdateUserPopup = false; this.selectedUser = {}; }
  saveUpdatedUser() {
    if (!this.selectedUser.memberId || !this.selectedUser.name || !this.selectedUser.email || !this.selectedUser.userId || !this.selectedUser.password) {
      return alert('Please fill all required fields!');
    }
    this.userService.updateUser(this.selectedUser).subscribe({
      next: () => { this.loadUsers(); this.closeUpdateUserPopup(); alert('User updated successfully'); },
      error: (err) => { console.error(err); alert('Error updating user'); }
    });
  }

  /** ---------------- DELETE USER ---------------- */
  openDeleteUserPopup(user: any) { this.selectedUser = { ...user }; this.showDeleteUserPopup = true; }
  closeDeleteUserPopup() { this.showDeleteUserPopup = false; this.selectedUser = {}; }
  confirmDeleteUser() {
    this.userService.deleteUser(this.selectedUser.memberId).subscribe({
      next: () => { this.loadUsers(); this.closeDeleteUserPopup(); alert('User deleted successfully'); },
      error: (err) => { console.error(err); alert('Error deleting user'); }
    });
  }

  /** ---------------- VIEW USER ---------------- */
  openViewUserPopup(user: any) { this.selectedUser = { ...user }; this.showViewUserPopup = true; }
  closeViewUserPopup() { this.showViewUserPopup = false; this.selectedUser = {}; }
}
