import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, Unsubscribe } from 'firebase/firestore';
import { firebaseConfig } from './firebase.config';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./app.css'],
  template: `
    <div class="container mt-5">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" integrity="sha384-9ndCyUa6mY5H0FB2jUl+QbXrmkvpuXvU3K5ODYkG3Rl1YATYapiaP0CUA/o0MGQ5" crossorigin="anonymous">
  
      <h1 class="mb-4">UniNote</h1>

      <div class="row mb-4">
        <div class="col-md-8">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              placeholder="New class name"
              [(ngModel)]="newClassName"
            />
            <button class="btn btn-success" type="button" (click)="addNewClass()">
              Add Class
            </button>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="input-group mb-3">
            <input
              type="text"
              class="form-control"
              placeholder="Search classes..."
              [(ngModel)]="searchTerm"
              (input)="onSearchInput()"
            />
            <button class="btn btn-outline-secondary" type="button" (click)="clearSearch()">
              Clear
            </button>
          </div>

          <div class="dropdown" [class.show]="isDropdownOpen">
            <button class="btn btn-secondary dropdown-toggle w-100" type="button" (click)="toggleDropdown()">
              {{ selectedClass ? selectedClass.name : 'Select a class' }}
            </button>
            <ul class="dropdown-menu w-100" [class.show]="isDropdownOpen">
              <li *ngFor="let classItem of filteredClasses">
                <button
                  type="button"
                  class="dropdown-item text-start"
                  (click)="selectClass(classItem)"
                >
                  {{ classItem.name }}
                </button>
              </li>
              <li *ngIf="filteredClasses.length === 0" class="dropdown-item disabled">
                No classes found.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dropdown-menu.show {
      display: block;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  classes: any[] = [];
  searchTerm = '';
  newClassName = '';
  selectedClass: any = null;
  isDropdownOpen = false;
  private unsubscribe?: Unsubscribe;
  private db: any;

  private router = inject(Router);

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const app = initializeApp(firebaseConfig);
      this.db = getFirestore(app);

      this.unsubscribe = onSnapshot(collection(this.db, 'classes'), (snapshot) => {
        this.classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  get filteredClasses() {
    if (!this.searchTerm) {
      return this.classes;
    }
    return this.classes.filter(c =>
      c.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onSearchInput() {
    this.isDropdownOpen = true;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  async selectClass(classItem: any) {
    this.selectedClass = classItem;
    this.isDropdownOpen = false;
    await this.router.navigate(['/class', classItem.name]);
  }

  clearSearch() {
    this.searchTerm = '';
    this.isDropdownOpen = false;
  }

  async addNewClass() {
    const trimmed = this.newClassName.trim();
    if (!trimmed || !this.db) {
      return;
    }

    try {
      await addDoc(collection(this.db, 'classes'), { name: trimmed });
      this.newClassName = '';
      this.searchTerm = trimmed;
      this.isDropdownOpen = true;
    } catch (error) {
      console.error('Unable to add class', error);
    }
  }
}