import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';

@Component({
    standalone: true,
    selector: 'app-post-page',
    imports: [],
    template: `
    <div style="padding: 20px;">
    <h1>{{ postContent }}</h1>
    </div>
    `,
    styles: [`
    h1 {
    font-size: 24px;}
    `]
})

export class PostPage implements OnInit, OnDestroy {
    postContent: string = '';
    private platformId = inject(PLATFORM_ID);

    constructor(private router: Router) {}

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            const state = history.state;
            if (state?.postContent) {
                this.postContent = state.postContent;
            }
        }
    }

    ngOnDestroy() { }
}