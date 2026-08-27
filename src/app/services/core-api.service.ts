import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CoreSearchRequest,
  CoreSearchResponse,
} from '../models/core-work.model';

@Injectable({ providedIn: 'root' })
export class CoreApiService {
  private readonly http = inject(HttpClient);
  private readonly searchUrl = '/v3/search/works';

  searchWorks(request: CoreSearchRequest): Observable<CoreSearchResponse> {
    const params = new HttpParams()
      .set('q', request.query)
      .set('limit', request.limit)
      .set('offset', request.offset);

    return this.http.get<CoreSearchResponse>(this.searchUrl, { params });
  }
}
