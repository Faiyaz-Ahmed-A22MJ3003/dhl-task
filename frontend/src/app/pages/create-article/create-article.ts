import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SourceType, Tag } from '../../models/article.model';
import { ArticlesService } from '../../services/articles.service';
import { TagsService } from '../../services/tags.service';

@Component({
  selector: 'app-create-article',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-article.html',
  styleUrl: './create-article.scss',
})
export class CreateArticle implements OnInit {
  title = '';
  summary = '';
  content = '';
  sourceText = '';
  sourceType: SourceType = 'TEXT';
  selectedTagNames: string[] = [];

  tags: Tag[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Booz admin user from seeded data
  createdById = 1;

  constructor(
    private articlesService: ArticlesService,
    private tagsService: TagsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadTags();
  }

  loadTags() {
    this.tagsService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load tags.';
        this.cdr.detectChanges();
      },
    });
  }

  toggleTag(tagName: string) {
    if (this.selectedTagNames.includes(tagName)) {
      this.selectedTagNames = this.selectedTagNames.filter((name) => name !== tagName);
    } else {
      this.selectedTagNames = [...this.selectedTagNames, tagName];
    }
  }

  isTagSelected(tagName: string) {
    return this.selectedTagNames.includes(tagName);
  }

  submitDraft() {
    if (this.loading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.title.trim() || !this.summary.trim() || !this.content.trim()) {
      this.errorMessage = 'Title, summary, and content are required.';
      return;
    }

    this.loading = true;

    const sourceHash = `manual-${Date.now()}-${this.title.toLowerCase().replace(/\s+/g, '-')}`;

    this.articlesService
      .createArticle({
        title: this.title,
        summary: this.summary,
        content: this.content,
        sourceText: this.sourceText,
        sourceType: this.sourceType,
        sourceHash,
        createdById: this.createdById,
        tagNames: this.selectedTagNames,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Draft article created successfully. Redirecting to Knowledge Articles...';

          this.title = '';
          this.summary = '';
          this.content = '';
          this.sourceText = '';
          this.sourceType = 'TEXT';
          this.selectedTagNames = [];

          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/articles']);
          }, 900);
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Failed to create draft article.';
          this.cdr.detectChanges();
        },
      });
  }
}
