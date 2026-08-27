import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CoreAuthor, CoreWork } from '../../models/core-work.model';

@Component({
  selector: 'app-paper-card',
  standalone: true,
  templateUrl: './paper-card.html',
  styleUrl: './paper-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaperCard {
  readonly paper = input.required<CoreWork>();

  readonly authors = computed(() => {
    const authors = this.paper().authors ?? [];
    const names = authors
      .map((author) => this.authorName(author))
      .filter((name): name is string => Boolean(name));

    if (names.length === 0) return 'Authors not listed';
    if (names.length <= 4) return names.join(', ');
    return `${names.slice(0, 4).join(', ')} +${names.length - 4} more`;
  });

  readonly abstract = computed(() => {
    const value = this.paper().abstract?.trim();
    if (!value) return 'No abstract is available for this record.';
    return value.length > 420 ? `${value.slice(0, 417).trim()}…` : value;
  });

  readonly primaryUrl = computed(() => {
    const paper = this.paper();
    if (paper.downloadUrl) return paper.downloadUrl;
    if (paper.sourceFulltextUrls?.length) return paper.sourceFulltextUrls[0];
    if (paper.doi) return `https://doi.org/${paper.doi}`;
    return null;
  });

  readonly publicationMeta = computed(() => {
    const paper = this.paper();
    const values = [
      paper.yearPublished ? String(paper.yearPublished) : null,
      paper.publisher?.trim() || null,
      paper.documentType?.trim() || null,
    ].filter((value): value is string => Boolean(value));

    return values.join(' · ') || 'Publication details unavailable';
  });

  private authorName(author: CoreAuthor | string): string | null {
    if (typeof author === 'string') return author.trim() || null;
    return author.name?.trim() || null;
  }
}
