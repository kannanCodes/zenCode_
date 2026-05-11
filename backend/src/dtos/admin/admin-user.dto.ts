export interface ListUsersQuery {
  page: number;
  limit: number;
  search?: string;
  isBlocked?: boolean;
  sortBy: 'createdAt' | 'lastActiveDate' | 'email';
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedUsersResponse {
  users: unknown[]; // Will be IUser[] in practice
  total: number;
}
