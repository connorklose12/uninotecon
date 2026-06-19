import { RouterOutlet } from '@angular/router';
import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AuthService } from './app.routes';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, AsyncPipe], 
  template: `
    <link rel="stylesheet" href="https://cloudflare.com">
    <h1 class="mb-1">UniNote Swap</h1>
      <button (click)="router.navigate([''])">HOME</button>
    <ng-container *ngIf="authService.currentUser$ | async as user; else loggedOut"> 
      <button (click)="authService.logout()">Logout</button>
    <p>Welcome, {{ user.email }}</p>
    </ng-container>

    
   
    <ng-template #loggedOut><p>Not logged in</p>
  
  <button (click)="router.navigate(['/login'])">Go to Login</button></ng-template>

   <router-outlet></router-outlet>
  
  `,
  styles: []
})
export class App {
router = inject(Router);
    authService = inject(AuthService);
}
