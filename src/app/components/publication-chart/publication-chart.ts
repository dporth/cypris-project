import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CoreWork } from '../../models/core-work.model';

interface YearBucket {
  year: number;
  count: number;
}

@Component({
  selector: 'app-publication-chart',
  standalone: true,
  templateUrl: './publication-chart.html',
  styleUrl: './publication-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicationChart {
  readonly papers = input<CoreWork[]>([]);
  readonly hasSearched = input(false);

  readonly buckets = computed<YearBucket[]>(() => {
    const counts = new Map<number, number>();

    for (const paper of this.papers()) {
      const year = paper.yearPublished;
      if (!year || year < 1800 || year > new Date().getFullYear() + 1) continue;
      counts.set(year, (counts.get(year) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year)
      .slice(-12);
  });

  readonly maxCount = computed(() =>
    Math.max(1, ...this.buckets().map((bucket) => bucket.count)),
  );

  barWidth(count: number): number {
    return Math.max(4, (count / this.maxCount()) * 100);
  }
}
