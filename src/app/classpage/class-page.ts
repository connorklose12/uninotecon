import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { collection, addDoc, onSnapshot, query, orderBy, where, getDocs, updateDoc, doc, Unsubscribe } from 'firebase/firestore';
import { db, storage } from '../firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Router } from '@angular/router';
import { App } from '../app';
import { AuthService } from '../app.routes';
import { getAuth } from 'firebase/auth';


interface Post {
  id?: string;
  content: string;
  timestamp: number;
  email?: string;
  liked?: boolean;
  likes?: number;
  attachments?: Array<{ name: string; url: string; type: string }>;
}


@Component({
  standalone: true,
  selector: 'app-class-page',
  imports: [CommonModule, FormsModule, App],
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
    <small style="color: #96ac7f;">{{post.email}}   {{ formatDate(post.timestamp) }}</small>
    
    <button 
      (click)="likePost(post); $event.stopPropagation()" 
      class="heart-btn"
      [class.liked]="post.liked">
      {{ post.liked ? '❤️' : '🤍' }}
    </button><small><a> {{post.likes}}</a></small>
  </button>
</div> 
      <div class="posts-container">
  <button *ngFor="let post of posts" class="post-box" (click)="openPost(post)">
    <p>{{ post.content }}</p>
    <small style="color: #96ac7f;">{{post.email}}   {{ formatDate(post.timestamp) }}</small>
    
    <button 
      (click)="likePost(post); $event.stopPropagation()" 
      class="heart-btn"
      [class.liked]="post.liked">
      {{ post.liked ? '❤️' : '🤍' }}
    </button><small><a> {{post.likes}}</a></small>
  </button>
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
    .heart-btn {
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.2s ease;
  line-height: 1;
}

.heart-btn:hover {
  transform: scale(1.2);
  background-color: rgba(255, 100, 100, 0.1);
}

.heart-btn.liked {
  animation: heartPop 0.3s ease;
}

@keyframes heartPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.4); }
  100% { transform: scale(1); }
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
authService = inject(AuthService);
 auth = getAuth();
  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.className = this.route.snapshot.paramMap.get('name') || '';

    //for browser
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
          const user = this.auth.currentUser;
        await addDoc(collection(this.db, 'classes', this.classId, 'posts'), {
          content: this.postContent,
          timestamp: Date.now()
        
        });
        this.postContent = '';
        email: user?.email || "Anonymous"
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
likePost(post: any) {
  post.liked = !post.liked;
  post.likes = (post.likes || 0) + (post.liked ? 1 : -1);
}

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
}