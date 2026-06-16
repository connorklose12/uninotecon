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
    <ng-container *ngIf="authService.currentUser$ | async as user; else loggedOut"> 
      <p>Welcome, {{ user.email }}</p>
      <button (click)="authService.logout()">Logout</button>
    </ng-container>

    <ng-template #loggedOut><p>Not logged in</p></ng-template>
   <ng-template #loggedOut><button (click)="router.navigate(['/login'])">Go to Login</button></ng-template> 
   
   <router-outlet></router-outlet>
  
  `,
  styles: []
})
export class App {
router = inject(Router);
    authService = inject(AuthService);
}
