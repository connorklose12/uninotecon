import { RouterOutlet } from '@angular/router';
import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AuthService } from './app.routes';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { db } from './firebase.config';
import { addDoc, getFirestore } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { collectionData } from '@angular/fire/firestore'
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
import { where, query, getDocs, deleteDoc, doc, onSnapshot, orderBy, Unsubscribe } from 'firebase/firestore';
import { OnDestroy } from '@angular/core';
import { onAuthStateChanged } from 'firebase/auth';



@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, AsyncPipe, FormsModule], 
  template: `
    <link rel="stylesheet" href="https://cloudflare.com">
    <h1 class="mb-1">NDSU UniNote Swap</h1>
    <div style="margin: 15px 0;">
   <svg class="bell-icon" (click)="notifOpen=!notifOpen" style="float: right; position: fixed; top: 16px; right: 16px; width: 40px; height: 40px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1-1.5-1s-1.5.17-1.5 1v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
  <div *ngIf="notifOpen">
    <div *ngIf="authService.currentUser$ | async as user"> 
  <p *ngIf="notifications.length === 0" class="me-3" style="float: right;">No replies yet.</p>
  <div *ngFor="let n of notifications">
    <ul *ngIf="n.toEmail===user.email">
           <button (click)="router.navigate(['class', n.className]); notifOpen=false"
            style="display: block; width: 50%; text-align: left; padding: 10px; border: none; border-bottom: 1px solid #eee; cursor: pointer; background: #f8f9fa;">
      reply: "On post from {{n.className}}: {{ n.replyContent }} {{n.timestamp}}"
    </button>
</ul>
  </div></div></div>
      <button (click)="router.navigate([''])">HOME</button>
    <ng-container *ngIf="authService.currentUser$ | async as user; else loggedOut"> 
      <button (click)="authService.logout()">Logout</button>
    <p>Welcome, {{ user.email }}.</p>

<div *ngFor="let userNamee of usernames">
  <p *ngIf="userNamee.emaill===user.email">Display name: {{userNamee.display}}</p>
</div></ng-container>
 <input type=text [(ngModel)]="displayy" placeholder="Set display name"/>
    <button (click)="setDisplay()">SET</button>

    
   
    <ng-template #loggedOut><p>Not logged in</p>
  
  <button (click)="router.navigate(['/login'])">Go to Login</button></ng-template>

   <router-outlet></router-outlet>
  
  `,
  styles: []
})
export class App implements OnInit{ //, OnDestroy{
router = inject(Router);
    authService = inject(AuthService);
displayy= '';
usera = '';
usernames: useR[]=[];
notifications: notifS[]=[]; 
hasDisplay: boolean=false;
private db = db;
notifOpen: boolean=false;
private notifUnsub?: Unsubscribe;
private fbAuth = getAuth();

    async setDisplay(){
      const usera= this.fbAuth.currentUser?.email || 'Anonymous';
const displayUsername: useR= {display:this.displayy, emaill: usera};

 //find and delete any existing username doc for this email
  const q = query(collection(this.db, 'usernames'), where('emaill', '==', usera));
  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(this.db, 'usernames', docSnap.id));
  }

await addDoc(collection(this.db, 'usernames'), displayUsername)
this.hasDisplay=true;
alert('Username set!');
    }

 ngOnInit(){
  collectionData(collection(this.db, 'usernames')).subscribe(data=>
   { this.usernames= data as useR[];}); 
   collectionData(collection(this.db, 'notifications')).subscribe(data=>
   { this.notifications= data as notifS[];}); 

/*  onAuthStateChanged(this.fbAuth, (user) => {
    if (this.notifUnsub) this.notifUnsub();
    if (!user?.email) {
      this.notifications = [];
      return;
    }
    this.notifUnsub = onSnapshot(
      query(
        collection(this.db, 'notifications'),
        where('toEmail', '==', user.email),
        orderBy('timestamp', 'desc')
      ),
      (snapshot) => {
        this.notifications = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } 
    );
  }); */
}

 /* ngOnDestroy() {
  if (this.notifUnsub) this.notifUnsub();
}
*/

}
  export interface useR{
      display: string;
      emaill: string;
    }

    export interface notifS {
      className: string;
      toEmail: string;
      replyContent: string;
      timestamp: number;
    }
  
