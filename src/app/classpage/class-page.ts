import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { collection, addDoc, onSnapshot, query, orderBy, where, getDocs, updateDoc, doc, Unsubscribe } from 'firebase/firestore';
import { db, storage } from '../firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Router } from '@angular/router';

interface Post {
  id?: string;
  content: string;
  timestamp: number;
  attachments?: Array<{ name: string; url: string; type: string }>;
}


@Component({
  standalone: true,
  selector: 'app-class-page',
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px;">
      <h1>{{ className }}</h1>
      <div class="input-group mb-3">
        <input 
          type="text"
          class="form-control"
          placeholder="Type your post"
          [(ngModel)]="postContent"
          (keyup.enter)="submitPost()"
        />
        <button class="btn btn-primary" (click)="submitPost()">Post</button>
      </div>
      
      <div class="posts-container">
        <button *ngFor="let post of posts" class="post-box" (click)="openPost(post)">
          <p>{{ post.content }}</p>
          <small style="color: #96ac7f;">{{ formatDate(post.timestamp) }}</small>
</button>
      </div>
    </div>
  `,
  styles: [`
    .post-box {
      width: 80%;
      text-align: left;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      background-color: #7edb8c;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .post-box p {
      margin: 0 0 5px 0;
      font-size: 14px;
      color: #333;
    }
    .post-box small {
      font-size: 12px;
    }
  `]
})
export class ClassPage implements OnInit, OnDestroy {
  className = '';
  postContent = '';
  searchTerm = '';
  selectedFiles: File[] = [];
  posts: Post[] = [];
  private db = db;
  private unsubscribe?: Unsubscribe;
  private classId = '';

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.className = this.route.snapshot.paramMap.get('name') || '';

    if (typeof window !== 'undefined') {
      await this.findClassAndLoadPosts();
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  get filteredPosts() {
    if (!this.searchTerm) {
      return this.posts;
    }
    return this.posts.filter(post =>
      post.content.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  private async findClassAndLoadPosts() {
    const q = query(collection(this.db, 'classes'), where('name', '==', this.className));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      this.classId = snapshot.docs[0].id;
    } else {
      const docRef = await addDoc(collection(this.db, 'classes'), { name: this.className });
      this.classId = docRef.id;
    }
    this.loadPosts();
  }

  private loadPosts() {
    const postsQuery = query(
      collection(this.db, 'classes', this.classId, 'posts'),
      orderBy('timestamp', 'desc')
    );

    this.unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      this.posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    });
  }

  async submitPost() {
    if (this.postContent.trim() && this.classId) {
      try {
        await addDoc(collection(this.db, 'classes', this.classId, 'posts'), {
          content: this.postContent,
          timestamp: Date.now()
        });
        this.postContent = '';
      } catch (error) {
        console.error('Unable to add post', error);
      }
    }
  }

  private router = inject(Router);
  private zone = inject(NgZone);

async openPost(post: Post) {
  await this.router.navigate(['post', post.id], { state: { postContent: post.content, classId: this.classId, className: this.className } });
}

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
}