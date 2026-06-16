import { Component } from '@angular/core';
import { HomeComponent } from '../../home.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HomeComponent],
  template: `
    <section style="padding:24px; max-width:720px; margin:0 auto;">
      <p>Thanks for logging in and using our service!</p>
    </section>
    <app-home></app-home>
  `,
})
export class DashboardComponent {}