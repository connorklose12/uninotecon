import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { FormsModule } from '@angular/forms';


@Component({
    standalone: true,
    selector: 'app-post-page',
    imports: [CommonModule, FormsModule],
    template: `
    <div style="padding: 20px;">
    <h1>{{ postContent }}</h1>
    <img *ngIf="imageURL" [src]="imageURL" style="width: 1000px; border-radius:6px;" /><br>
     
    </div>
    `,
    styles: [`
    h1 {
    font-size: 24px;}
    `]
})

export class PostPage implements OnInit, OnDestroy {
    postContent: string = '';
    imageURL: string = '';
    private platformId = inject(PLATFORM_ID);

    constructor(private router: Router) {}

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            const state = history.state;
            if (state?.postContent) {
                this.postContent = state.postContent;
            }
             if (state?.imageURL) {
            this.imageURL = state.imageURL; // ← add this
        }
        }
    }

    ngOnDestroy() { }
}