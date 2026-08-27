export interface CoreAuthor {
  name?: string | null;
}

export interface CoreWork {
  id?: number | string | null;
  title?: string | null;
  authors?: Array<CoreAuthor | string> | null;
  abstract?: string | null;
  yearPublished?: number | null;
  doi?: string | null;
  publisher?: string | null;
  documentType?: string | null;
  language?: string | null;
  downloadUrl?: string | null;
  sourceFulltextUrls?: string[] | null;
}

export interface CoreSearchResponse {
  totalHits?: number;
  limit?: number;
  offset?: number;
  results?: CoreWork[];
}

export interface CoreSearchRequest {
  query: string;
  limit: number;
  offset: number;
}
