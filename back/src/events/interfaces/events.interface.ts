export interface EventResponse {
  id: string;
  name: string;
  userId: string | null;
  sessionId: string | null;
  properties: unknown;
  context: unknown;
  ts: string;
  createdAt: string;
}

export interface EventsListResponse {
  events: EventResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
