import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss']
})
export class CommunityComponent implements OnInit {
  posts: any[] = [];
  selectedFile: File | null = null;

  constructor(public http: HttpClient, public authService: AuthService) {}

  ngOnInit() {
    this.fetchPosts();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  fetchPosts() {
    const headers = { Authorization: `Bearer ${this.authService.accessToken}` };
    this.http.get<any[]>('http://localhost:8085/api/community/posts', { headers }).subscribe({
      next: (data) => {
        this.posts = data;
        if (this.posts.length === 0) {
          this.showMockPosts();
        }
      },
      error: () => this.showMockPosts()
    });
  }

  showMockPosts() {
    this.posts = [
      {
        id: 'post_1',
        authorId: 'GhostRider',
        content: 'Just finished an amazing 200km ride through the mountains!',
        imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        likes: [],
        createdAt: new Date().toISOString()
      }
    ];
  }

  createPost(content: string, inputEl: HTMLTextAreaElement) {
    if (!content && !this.selectedFile) return;
    
    const formData = new FormData();
    formData.append('content', content);
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    const headers = { Authorization: `Bearer ${this.authService.accessToken}` };
    this.http.post('http://localhost:8085/api/community/posts', formData, { headers }).subscribe({
      next: () => {
        this.selectedFile = null;
        inputEl.value = '';
        this.fetchPosts();
      },
      error: (err) => {
        alert('Failed to post. Please try again.');
        console.error(err);
      }
    });
  }

  toggleLike(post: any) {
    const headers = { Authorization: `Bearer ${this.authService.accessToken}` };
    this.http.post(`http://localhost:8085/api/community/posts/${post.id}/like`, {}, { headers }).subscribe(() => {
      this.fetchPosts();
    });
  }
}
