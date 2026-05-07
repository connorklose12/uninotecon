import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ClassPage } from './classpage/class-page';
import { PostPage } from './classpage/post-page';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'class/:name', component: ClassPage },
  { path: 'post/:id', component: PostPage },
  { path: '**', redirectTo: '' }
];
