import { Routes } from '@angular/router';
import { ClassPage } from './classpage/class-page';
import { HomeComponent } from './home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'class/:name', component: ClassPage }
];