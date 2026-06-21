import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, Unsubscribe, getDocs, query, where } from 'firebase/firestore';
import { firebaseConfig } from './firebase.config';
import emailjs from '@emailjs/browser';
import { AuthService } from './app.routes';
import { getAuth } from 'firebase/auth';


@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./app.css'],
  template: `
    <div class="container mt-5">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">

      <div class="row mb-4">
        <div class="col-md-8">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              placeholder="Add new class name"
              [(ngModel)]="newClassName"
            />
            <button class="btn btn-success" type="button" (click)="addNewClass(isRed)">
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
            <button class="btn btn-outline-success dropdown-toggle w-100" type="button" (click)="toggleDropdown()" style="border-color: #155724; color: #155724; font-weight: bold;">
              {{ selectedClass ? selectedClass.name : 'Select a class' }}
            </button>
            <ul class="dropdown-menu w-100" [class.show]="isDropdownOpen" style="border-color: #155724;">
              <li *ngFor="let classItem of filteredClasses">
                <div class="button-container"><div *ngIf="classItem.colorr"><button
                  type="button" [style.color]="'#155724'" class="dropdown-item text-start"
                  [style.background-color]="'#a2e6a7'"
                  (click)="selectClass(classItem)"
                  style="font-weight: 500; border-left: 4px solid #155724; padding-left: 8px;"
                >
                  {{ classItem.name }}
                </button><button *ngIf="!classItem.postCount">No posts here yet</button>
                <button *ngIf="classItem.postCount>0">⭐</button></div></div>
                <div *ngIf="!classItem.colorr"><button
                  type="button" [style.color]="'maroon'"class="dropdown-item text-start"
                  [style.background-color]="'#eabed4'"
                  (click)="selectClass(classItem)"
                  style="font-weight: 500; border-left: 4px solid #155724; padding-left: 8px;"
                >{{ classItem.name }}
                </button>
                <button *ngIf="!classItem.postCount">No posts here yet</button>
                <button *ngIf="classItem.postCount>0">⭐</button></div>
                  
                
                </li>
              <li *ngIf="filteredClasses.length === 0" class="dropdown-item disabled">
                No classes found.
              </li>
            </ul>
          </div>
          <div class="mt-5"><p>\n Hi, welcome! This is a site for sharing notes, advice, questions, and \n discussions with other people at NDSU who are in the same class as you to help \n each other get through the course. Any questions, comments, concerns, ideas, or \n posts you'd like to report can be mentioned in this box here. I'll try to Email back. Thanks!</p>
<input type="text" placeholder="Share here" [(ngModel)]="emailMessage"/>
<button (click)="submitMessage()">SUBMIT</button></div>
        </div>
      </div>
    </div>`,
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
  emailMessage ='';
  selectedClass: any = null;
  isDropdownOpen = false;
  isRed: boolean=false;
  private unsubscribe?: Unsubscribe;
  private db: any;
private fbAuth = getAuth();
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

async submitMessage() {
  if (!this.emailMessage.trim()) return;
  await emailjs.send(
    'service_r9f0rts',
    'template_tzuonvv',
    { emailMess: this.emailMessage,
      name: this.fbAuth.currentUser?.email || 'Anonymous'
    },
    '5rNRJdXhoCEbdgmcJ'
  );

  alert('Message sent!');
  this.emailMessage = '';
}

  async addNewClass(isRe: boolean) {
    const trimmed = this.newClassName.trim();
    if (!trimmed || !this.db) {
      return;
    }

    try {
      await addDoc(collection(this.db, 'classes'), { name: trimmed, colorr: isRe });
      this.newClassName = '';
      this.searchTerm = trimmed;
      this.isDropdownOpen = true;
    } catch (error) {
      console.error('Unable to add class', error);
    }
  }
}