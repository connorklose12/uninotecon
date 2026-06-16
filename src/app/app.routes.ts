
import { HomeComponent } from './home.component';
import { ClassPage } from './classpage/class-page';
import { PostPage } from './classpage/post-page';
import { Routes, Router, CanActivateFn } from '@angular/router';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import {
Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
signInWithPopup, GoogleAuthProvider, signOut, user
} from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

// ─── Auth Service ────────────────────────────────────────────────
@Injectable({ providedIn: 'root' }) //lets u use the code in other files with inject(), root makes it available in all files
export class AuthService {
private auth = inject(Auth);
currentUser$ = user(this.auth); //Creates an observable of the currently logged in user that updates when auth state changes (login/logout).

login(email: string, password: string) {
return signInWithEmailAndPassword(this.auth, email, password);
}
register(email: string, password: string) {
return createUserWithEmailAndPassword(this.auth, email, password);
}
loginWithGoogle() {
return signInWithPopup(this.auth, new GoogleAuthProvider());
}
logout() {
return signOut(this.auth);
}
}

// ─── Auth Guard ──────────────────────────────────────────────────
export const authGuard: CanActivateFn = () => {   //Defines a route guard, a function that //runs before a route loads to decide if the user is allowed to access it, returns true/false. ex; 
//If you paste the dashboard URL directly into the browser without being logged in, the guard //catches it and sends you back to `/login`. or if ur login expires, or if you call logout().

const auth = inject(Auth);
const router = inject(Router); //redirects the user to `/login` if they're not authenticated.
return user(auth).pipe(  //pipe lets you run the value through a series of steps
take(1), //only checks once, doesn't keep listening
map(u => u ? true : router.createUrlTree(['/login'])) // if user exists allow access, if not redirect to `/login`
);
};

// ─── Login Component ─────────────────────────────────────────────
@Component({
selector: 'app-login',
standalone: true,
imports: [CommonModule, FormsModule],

template: `<div style="max-width:360px;margin:80px auto;display:flex;flex-direction:column;gap:12px">
<h2>{{ isRegistering ? 'Create Account' : 'Sign In' }}</h2>
<input type="email" [(ngModel)]="email" placeholder="Email" />       <input type="password" [(ngModel)]="password" placeholder="Password" />
<p *ngIf="error()" style="color:red;font-size:14px">{{ error() }}</p>
<button (click)="submit()">{{ isRegistering ? 'Register' : 'Login' }}</button>       <button (click)="loginWithGoogle()">Continue with Google</button>
<p style="font-size:13px;text-align:center">
{{ isRegistering ? 'Already have an account?' : "Don't have an account?" }}         
<a (click)="isRegistering = !isRegistering" style="cursor:pointer;color:blue">           {{ isRegistering ? 'Sign in' : 'Register' }}         </a>       </p>     </div> ` 
})
export class LoginComponent {
private authService = inject(AuthService);
private router = inject(Router);
email = ''; password = ''; isRegistering = false;
error = signal('');

async submit() {  //runs when the login/register button is clicked, registers, if succeeds it navigates to dashboard, if fails it displays the error message.
this.error.set('');
try {
this.isRegistering
? await this.authService.register(this.email, this.password)
: await this.authService.login(this.email, this.password);
this.router.navigate(['/dashboard']); 
} catch (e: any) { this.error.set(e.message); }
}

async loginWithGoogle() {
try {
await this.authService.loginWithGoogle();
this.router.navigate(['/dashboard']);
} catch (e: any) { this.error.set(e.message); }
}
}


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'class/:name', component: ClassPage },
  { path: 'post/:id', component: PostPage },
  { path: 'login', component: LoginComponent },
 {
path: 'dashboard',
loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),   //only loads the dashboard component when user navigates to that route, instead of loading it upfront with everything else.
canActivate: [authGuard]  //Runs the auth guard before allowing access to that route.
}, 
{ path: '**', redirectTo: '' }
];
