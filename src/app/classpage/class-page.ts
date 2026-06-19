import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { collection, addDoc, deleteDoc, onSnapshot, query, orderBy, where, getDocs, increment, updateDoc, doc, Unsubscribe} from 'firebase/firestore';
import { db, storage } from '../firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Router } from '@angular/router';
import { AuthService } from '../app.routes';
import { arrayRemove, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


interface Post {
  id?: string;
  content: string;
  timestamp: number;
  email?: string;
  liked?: boolean;
  likes?: number;
  likedBy?: string[];
  replies?: any[];
  imageUrl?: string; 
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
   <textarea
  class="form-control"
  placeholder="Type your post"
  [(ngModel)]="postContent"
  rows="1"
  style="resize: none; overflow: hidden;"
  (input)="autoResize($event)" ></textarea>
<input type="file" accept="image/*" (change)="onFileSelected($event)" />
    <small *ngIf="selectedImage" style="padding: 5px; color: green;">
  ✓ {{ selectedImage.name }}
</small>
     <button class="btn btn-primary" (click)="submitPost()">Post</button>
  </div>

  <div class="posts-container">
    <div *ngFor="let post of posts">
      <div class="post-box" (click)="openPost(post)">
        <p>{{ post.content }}</p>
   <img *ngIf="post.imageUrl" [src]="post.imageUrl" style="max-width:100%; border-radius:6px;" /><br>
        <small style="color: #96ac7f;">{{post.email}} {{ formatDate(post.timestamp) }}</small>
        
        <button (click)="likePost(post); $event.stopPropagation()" class="heart-btn" [class.liked]="post.liked">
          {{ post.liked ? '❤️' : '🤍' }}
        </button>
        <small> {{post.likes}} </small>
        <button *ngIf="post.email === auth.currentUser?.email" (click)="deletePost(post); 
        $event.stopPropagation()" style="margin-left: 30px;">DELETE</button>
        <button style="margin-left: 30px;" (click)="toggleReply(post); $event.stopPropagation()">REPLY</button>
      </div>

      <div *ngFor="let reply of post.replies" style="margin-left: 40px; padding: 8px; border-left: 3px solid #96ac7f;">
        <p>{{ reply.content }}</p>
        <small style="color: #96ac7f;">{{ reply.email }}</small>
      </div>

      <div *ngIf="openReplyForPost === post.id">
        <input class="form-control" style="margin-left: 40px; width: 70%;" placeholder="Write a reply..." [(ngModel)]="replyContent"/>
        <button class="btn btn-success" (click)="submitReply(post)">Send</button>
      </div>
    </div>
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


    .post-box {
  color: #333;
}
    .post-box p {
      margin: 0 0 5px 0;
      font-size: 14px;
      color: #333;
       white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
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
  replyContent = '';
  searchTerm = '';
  posts: Post[] = [];
  private db = db;
  private unsubscribe?: Unsubscribe;
  private classId = '';
  openReplyForPost: string | null = null;
  openReply: boolean=false;
authService = inject(AuthService);
 auth = getAuth();
  constructor(private route: ActivatedRoute) {}
  selectedImage: File | null = null;


  autoResize(event: any) {
  event.target.style.height = 'auto';
  event.target.style.height = event.target.scrollHeight + 'px';
}


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
    const email = this.auth.currentUser?.email;
    this.posts = snapshot.docs.map(doc => {
      const data = doc.data();
      const likedBy = data['likedBy'] || [];
      return {
        id: doc.id, ...data, likedBy,
        likes: likedBy.length,
        liked: likedBy.includes(email),
        replies: []
      } as any;
    });

    this.posts.forEach(post => {
      onSnapshot(
        query(collection(this.db, 'classes', this.classId, 'posts', post.id!, 'replies'), orderBy('timestamp', 'asc')),
        snap => { post.replies = snap.docs.map(d => ({ id: d.id, ...d.data() })); }
      );
    });
  });
}


  async submitPost() {
  if (!this.classId) return;
  if (!this.postContent.trim() && !this.selectedImage) return; // allow image-only posts

  try {
    const user = this.auth.currentUser;
    let imageUrl = '';

    if (this.selectedImage) {
      const imgRef = ref(storage, `posts/${Date.now()}_${this.selectedImage.name}`);
      await uploadBytes(imgRef, this.selectedImage);
      imageUrl = await getDownloadURL(imgRef);
      this.selectedImage = null;
    }

    await addDoc(collection(this.db, 'classes', this.classId, 'posts'), {
      content: this.postContent,
      timestamp: Date.now(),
      email: user?.email || 'Anonymous',
      imageUrl
    });

    this.postContent = '';
  } catch (error) {
    console.error('Submit failed:', error); // check browser console for this
  alert('Submit failed. Likely cause: not enough storage on website.')
  }
}
  

  async deletePost(post: Post){
      console.log('deleting post:', post.id, 'classId:', this.classId);
await deleteDoc(doc(this.db, 'classes', this.classId, 'posts', post.id!));
  }

onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  this.selectedImage = input.files?.[0] ?? null;
}

toggleReply(post: any) {
  this.openReplyForPost = this.openReplyForPost === post.id ? null : post.id;
}

async submitReply(post: any) {
  if (!this.replyContent.trim()) return;
  const user = this.auth.currentUser;
  await addDoc(collection(this.db, 'classes', this.classId, 'posts', post.id, 'replies'), {
    content: this.replyContent,
    timestamp: Date.now(),
    email: user?.email || 'Anonymous'
  });
  this.replyContent = '';
}
  private router = inject(Router);
  private zone = inject(NgZone);

async openPost(post: Post) {
  await this.router.navigate(['post', post.id], { state: { postContent: post.content, classId: this.classId, className: this.className, imageURL: post.imageUrl} });

}
async likePost(post: any) {
  const email = this.auth.currentUser?.email;
  if (!email) return;

  const postRef = doc(this.db, 'classes', this.classId, 'posts', post.id);
  const alreadyLiked = (post.likedBy || []).includes(email);

  await updateDoc(postRef, {
    likedBy: alreadyLiked ? arrayRemove(email) : arrayUnion(email)
  });
} 

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
}