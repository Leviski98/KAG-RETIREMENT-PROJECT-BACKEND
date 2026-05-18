# API Client Documentation

This document provides information on how to use the shared API client for the KAG Retirement Project frontend.

## Table of Contents

- [Setup](#setup)
- [Base Client](#base-client)
- [District API](#district-api)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)
- [Examples with TanStack Query](#examples-with-tanstack-query)

## Setup

### Environment Variables

The API client uses environment variables to configure the backend API URL. Create a `.env.local` file in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

For production, update this to your production API URL.

## Base Client

The base API client (`lib/api/client.ts`) provides low-level HTTP methods and common utilities:

```typescript
import { apiClient } from '@/lib/api/client';

// GET request
const data = await apiClient.get('/endpoint/', { param1: 'value' });

// POST request
const created = await apiClient.post('/endpoint/', { name: 'District 1' });

// PUT request
const updated = await apiClient.put('/endpoint/1/', { name: 'Updated Name' });

// PATCH request
const patched = await apiClient.patch('/endpoint/1/', { name: 'New Name' });

// DELETE request
await apiClient.delete('/endpoint/1/');
```

### Paginated Responses

The base client includes a `PaginatedResponse<T>` type for Django REST Framework paginated results:

```typescript
import { PaginatedResponse } from '@/lib/api/client';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
```

## District API

The district API client (`lib/api/district.ts`) provides type-safe methods for all district endpoints.

### Import

```typescript
import { districtApi } from '@/lib/api';
// or
import { districtApi, getAllDistricts, createDistrict } from '@/lib/api';
```

### Available Methods

#### 1. Get All Districts (Paginated)

```typescript
const response = await districtApi.getAll({
  search: 'Nairobi',
  ordering: 'name',
  page: 1,
  page_size: 10
});

console.log(response.results); // District[]
console.log(response.count); // Total count
```

#### 2. Get District by ID

```typescript
const district = await districtApi.getById(1);
console.log(district.name);
console.log(district.district_id); // "DIS001"
```

#### 3. Create District

```typescript
const newDistrict = await districtApi.create({
  name: 'Nairobi District'
});
```

#### 4. Update District (Full)

```typescript
const updated = await districtApi.update(1, {
  name: 'Updated District Name'
});
```

#### 5. Partial Update District

```typescript
const patched = await districtApi.partialUpdate(1, {
  name: 'New Name'
});
```

#### 6. Delete District

```typescript
await districtApi.delete(1);
```

#### 7. Get District Statistics

```typescript
const stats = await districtApi.getStatistics();
console.log(stats.total_districts);
console.log(stats.recent_districts);
console.log(stats.oldest_district);
console.log(stats.newest_district);
```

#### 8. Get District Summary

```typescript
const summary = await districtApi.getSummary(1);
console.log(summary.district);
```

#### 9. Bulk Create Districts

```typescript
const districts = await districtApi.bulkCreate({
  districts: [
    { name: 'District 1' },
    { name: 'District 2' },
    { name: 'District 3' }
  ]
});
// Maximum 10 districts per request
```

## Error Handling

All API methods throw `ApiRequestError` for failed requests:

```typescript
import { ApiRequestError } from '@/lib/api';

try {
  const district = await districtApi.getById(999);
} catch (error) {
  if (error instanceof ApiRequestError) {
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Response:', error.response);

    // Handle specific status codes
    if (error.status === 404) {
      // District not found
    } else if (error.status === 400) {
      // Bad request
    }
  }
}
```

## TypeScript Types

All types are defined in `types/district.ts`:

```typescript
interface District {
  id: number;
  district_id: string; // e.g., "DIS001"
  name: string;
  created_at: string;
  updated_at: string;
}

interface CreateDistrictInput {
  name: string;
}

interface UpdateDistrictInput {
  name?: string;
}

interface DistrictStatistics {
  total_districts: number;
  recent_districts: number;
  oldest_district: string | null;
  newest_district: string | null;
}

interface DistrictQueryParams {
  search?: string;
  ordering?: string;
  name?: string;
  page?: number;
  page_size?: number;
}
```

## Examples with TanStack Query

### Setup Query Client

First, set up the QueryClient in your app:

```typescript
// app/providers.tsx or similar
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Query Hooks

#### Fetch All Districts

```typescript
import { useQuery } from '@tanstack/react-query';
import { districtApi } from '@/lib/api';

function DistrictsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['districts'],
    queryFn: () => districtApi.getAll(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.results.map(district => (
        <li key={district.id}>{district.name}</li>
      ))}
    </ul>
  );
}
```

#### Fetch Single District

```typescript
function DistrictDetail({ id }: { id: number }) {
  const { data: district, isLoading } = useQuery({
    queryKey: ['districts', id],
    queryFn: () => districtApi.getById(id),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>{district?.name}</h2>
      <p>ID: {district?.district_id}</p>
    </div>
  );
}
```

#### Search Districts

```typescript
function SearchDistricts() {
  const [search, setSearch] = useState('');

  const { data } = useQuery({
    queryKey: ['districts', 'search', search],
    queryFn: () => districtApi.getAll({ search }),
    enabled: search.length > 0,
  });

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search districts..."
      />
      {/* Display results */}
    </div>
  );
}
```

### Mutation Hooks

#### Create District

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { districtApi } from '@/lib/api';

function CreateDistrictForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: districtApi.create,
    onSuccess: () => {
      // Invalidate and refetch districts list
      queryClient.invalidateQueries({ queryKey: ['districts'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      name: formData.get('name') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create District'}
      </button>
      {mutation.isError && <p>Error: {mutation.error.message}</p>}
    </form>
  );
}
```

#### Update District

```typescript
function UpdateDistrictForm({ id }: { id: number }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDistrictInput }) =>
      districtApi.partialUpdate(id, data),
    onSuccess: (data) => {
      // Update the cached district
      queryClient.setQueryData(['districts', id], data);
      // Invalidate the list
      queryClient.invalidateQueries({ queryKey: ['districts'] });
    },
  });

  const handleSubmit = (name: string) => {
    mutation.mutate({ id, data: { name } });
  };

  return (
    <div>
      {/* Form UI */}
      {mutation.isSuccess && <p>Updated successfully!</p>}
    </div>
  );
}
```

#### Delete District

```typescript
function DeleteDistrictButton({ id }: { id: number }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: districtApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['districts'] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate(id)}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

### Statistics Query

```typescript
function DistrictStatistics() {
  const { data: stats } = useQuery({
    queryKey: ['districts', 'statistics'],
    queryFn: districtApi.getStatistics,
    refetchInterval: 60000, // Refetch every minute
  });

  return (
    <div>
      <h3>District Statistics</h3>
      <p>Total: {stats?.total_districts}</p>
      <p>Recent (30 days): {stats?.recent_districts}</p>
      <p>Oldest: {stats?.oldest_district}</p>
      <p>Newest: {stats?.newest_district}</p>
    </div>
  );
}
```

### Bulk Create

```typescript
function BulkCreateDistricts() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: districtApi.bulkCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['districts'] });
    },
  });

  const handleBulkCreate = () => {
    mutation.mutate({
      districts: [
        { name: 'District A' },
        { name: 'District B' },
        { name: 'District C' },
      ],
    });
  };

  return (
    <button onClick={handleBulkCreate} disabled={mutation.isPending}>
      Create Multiple Districts
    </button>
  );
}
```

## Best Practices

1. **Use Query Keys Consistently**: Keep query keys organized and predictable
   ```typescript
   ['districts'] // All districts
   ['districts', id] // Single district
   ['districts', 'statistics'] // Statistics
   ['districts', 'search', searchTerm] // Search results
   ```

2. **Handle Loading and Error States**: Always provide feedback to users
   ```typescript
   if (isLoading) return <Loading />;
   if (error) return <ErrorMessage error={error} />;
   ```

3. **Invalidate Queries After Mutations**: Keep data fresh
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['districts'] });
   }
   ```

4. **Use Optimistic Updates**: For better UX on updates
   ```typescript
   onMutate: async (newData) => {
     await queryClient.cancelQueries({ queryKey: ['districts', id] });
     const previous = queryClient.getQueryData(['districts', id]);
     queryClient.setQueryData(['districts', id], newData);
     return { previous };
   },
   onError: (err, variables, context) => {
     queryClient.setQueryData(['districts', id], context?.previous);
   },
   ```

5. **Type Safety**: Leverage TypeScript for compile-time safety
   ```typescript
   const { data } = useQuery<PaginatedResponse<District>>({
     queryKey: ['districts'],
     queryFn: districtApi.getAll,
   });
   ```

## Next Steps

- Create similar API clients for Sections and Pastors
- Add authentication headers when implementing auth
- Consider adding request/response interceptors for logging
- Implement retry logic for failed requests
- Add request cancellation for search queries
