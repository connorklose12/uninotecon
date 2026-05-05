import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-class-page',
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h1>{{ className }}</h1>
    </div>
  `
})
export class ClassPage implements OnInit {
  className = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.className = this.route.snapshot.paramMap.get('name') || '';
  }
}