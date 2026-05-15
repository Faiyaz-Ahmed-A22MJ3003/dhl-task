import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SourceType } from '../../models/article.model';
import { ArticlesService } from '../../services/articles.service';
import { AttachmentsService } from '../../services/attachments.service';

@Component({
  selector: 'app-upload-console',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './upload-console.html',
  styleUrl: './upload-console.scss',
})
export class UploadConsole {
  title = '';
  summary = '';
  sourceText = '';
  content = '';
  sourceType: SourceType = 'TEXT';
  selectedFile?: File;

  selectedTagNames: string[] = ['SOP'];
  availableTags = [
    'Delivery',
    'Warehouse',
    'Customs',
    'Finance',
    'Invoice',
    'Customer Support',
    'SOP',
    'System Error',
    'Training',
  ];

  loading = false;
  errorMessage = '';
  successMessage = '';
  createdArticleId?: number;

  // Booz admin user
  createdById = 1;

  constructor(
    private articlesService: ArticlesService,
    private attachmentsService: AttachmentsService,
    private cdr: ChangeDetectorRef
  ) { }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.selectedFile = file;

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      this.sourceType = 'PDF';
    } else if (fileName.endsWith('.docx')) {
      this.sourceType = 'DOCX';
    } else if (fileName.endsWith('.txt')) {
      this.sourceType = 'TEXT';
    } else if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      this.sourceType = 'IMAGE';
    } else {
      this.sourceType = 'OTHER';
    }
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

  generateSimpleHash(text: string): string {
    let hash = 0;

    const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ');

    for (let i = 0; i < normalizedText.length; i++) {
      const char = normalizedText.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return `upload-${Math.abs(hash)}`;
  }

  submitUpload() {
    if (this.loading) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.createdArticleId = undefined;

    if (!this.title.trim() || !this.summary.trim() || !this.content.trim()) {
      this.errorMessage = 'Title, summary, and structured SOP content are required.';
      return;
    }

    this.loading = true;

    const duplicateBaseText = `${this.title} ${this.summary} ${this.content} ${this.sourceText} ${this.selectedFile?.name || ''}`;
    const sourceHash = this.generateSimpleHash(duplicateBaseText);

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
        next: (article) => {
          this.createdArticleId = article.id;

          if (this.selectedFile) {
            this.attachmentsService.uploadAttachment(article.id, this.selectedFile).subscribe({
              next: () => {
                this.finishSuccess(article.id);
              },
              error: () => {
                this.loading = false;
                this.errorMessage =
                  'Draft was created, but the attachment upload failed. You can upload the file again from the article details page.';
                this.cdr.detectChanges();
              },
            });
          } else {
            this.finishSuccess(article.id);
          }
        },
        error: () => {
          this.loading = false;
          this.errorMessage =
            'Failed to create draft from uploaded input. The same source may already exist.';
          this.cdr.detectChanges();
        },
      });
  }

  finishSuccess(articleId: number) {
    this.loading = false;
    this.createdArticleId = articleId;
    this.successMessage = `Upload processed successfully. Draft article #${articleId} was created.`;

    this.title = '';
    this.summary = '';
    this.sourceText = '';
    this.content = '';
    this.sourceType = 'TEXT';
    this.selectedFile = undefined;
    this.selectedTagNames = ['SOP'];

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    this.cdr.detectChanges();
  }
}