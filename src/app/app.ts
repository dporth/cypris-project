import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PaperCard } from './components/paper-card/paper-card';
import { PublicationChart } from './components/publication-chart/publication-chart';
import { CoreWork } from './models/core-work.model';
import { CoreApiService } from './services/core-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, PaperCard, PublicationChart],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly coreApi = inject(CoreApiService);
  private readonly historyStorageKey = 'mini-cypris-search-history';

  query = '';
  pageSize = 20;

  readonly works = signal<CoreWork[]>([]);
  readonly totalHits = signal(0);
  readonly offset = signal(0);
  readonly loading = signal(false);
  readonly hasSearched = signal(false);
  readonly errorMessage = signal('');
  readonly searchHistory = signal<string[]>(this.readHistory());

  readonly currentPage = computed(() => Math.floor(this.offset() / this.pageSize) + 1);
  readonly totalPages = computed(() => {
    const total = this.totalHits();
    return total > 0 ? Math.ceil(total / this.pageSize) : 0;
  });
  readonly firstResultNumber = computed(() =>
    this.works().length > 0 ? this.offset() + 1 : 0,
  );
  readonly lastResultNumber = computed(() => this.offset() + this.works().length);
  readonly canGoPrevious = computed(() => this.offset() > 0 && !this.loading());
  readonly canGoNext = computed(() => {
    if (this.loading() || this.works().length === 0) return false;
    return this.offset() + this.works().length < this.totalHits();
  });

  readonly examples = [
    'drone AND (package OR delivery)',
    '"machine learning" AND healthcare',
    'Research document explaining the benefits of hiring Desmond Porth OR ("How to hire Desmond Porth")',
  ];

  search(resetOffset = true): void {
    const normalizedQuery = this.query.trim();
    if (!normalizedQuery || this.loading()) return;

    if (resetOffset) this.offset.set(0);
    this.errorMessage.set('');
    this.loading.set(true);

    this.coreApi
      .searchWorks({
        query: normalizedQuery,
        limit: this.pageSize,
        offset: this.offset(),
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.works.set(response.results ?? []);
          this.totalHits.set(response.totalHits ?? 0);
          this.hasSearched.set(true);
          this.rememberQuery(normalizedQuery);
        },
        error: (error: HttpErrorResponse) => {
          this.works.set([]);
          this.totalHits.set(0);
          this.hasSearched.set(true);
          this.errorMessage.set(this.describeError(error));
        },
      });
  }

  useExample(example: string): void {
    this.query = example;
    this.search();
  }

  useHistoryItem(historyQuery: string): void {
    this.query = historyQuery;
    this.search();
  }

  pageSizeChanged(): void {
    this.pageSize = Math.min(100, Math.max(1, Math.round(Number(this.pageSize) || 20)));
    if (this.hasSearched() && this.query.trim()) this.search(true);
  }

  previousPage(): void {
    if (!this.canGoPrevious()) return;
    this.offset.update((value) => Math.max(0, value - this.pageSize));
    this.search(false);
    this.scrollToResults();
  }

  nextPage(): void {
    if (!this.canGoNext()) return;
    this.offset.update((value) => value + this.pageSize);
    this.search(false);
    this.scrollToResults();
  }

  exportCsv(): void {
    const papers = this.works();
    if (papers.length === 0) return;

    const headers = ['Title', 'Authors', 'Year', 'DOI', 'Publisher', 'Type', 'URL'];
    const rows = papers.map((paper) => [
      paper.title ?? '',
      this.formatAuthors(paper),
      paper.yearPublished ?? '',
      paper.doi ?? '',
      paper.publisher ?? '',
      paper.documentType ?? '',
      paper.downloadUrl ?? paper.sourceFulltextUrls?.[0] ?? '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => this.csvCell(String(value))).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `core-search-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private describeError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'CORE API could not be reached from the browser. Check your network connection or CORS policy and try again.';
    }
    if (error.status === 401 || error.status === 403) {
      return 'CORE rejected this request. The public endpoint may require an API key for your current usage level.';
    }
    if (error.status === 429) {
      return 'CORE rate-limited the request. Try again.';
    }
    return `CORE returned HTTP ${error.status || 'error'}. ry again.`;
  }

  private rememberQuery(value: string): void {
    const updated = [value, ...this.searchHistory().filter((item) => item !== value)].slice(0, 5);
    this.searchHistory.set(updated);
    try {
      localStorage.setItem(this.historyStorageKey, JSON.stringify(updated));
    } catch {
      // Search still works if localStorage is unavailable.
    }
  }

  private readHistory(): string[] {
    try {
      const stored = localStorage.getItem(this.historyStorageKey);
      if (!stored) return [];
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string').slice(0, 5)
        : [];
    } catch {
      return [];
    }
  }

  private formatAuthors(paper: CoreWork): string {
    return (paper.authors ?? [])
      .map((author) => (typeof author === 'string' ? author : author.name ?? ''))
      .filter(Boolean)
      .join('; ');
  }

  private csvCell(value: string): string {
    return `"${value.replaceAll('"', '""')}"`;
  }

  private scrollToResults(): void {
    requestAnimationFrame(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
