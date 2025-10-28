# Insights API Documentation

## Overview

The Insights API provides analytics data derived from event tracking using pre-aggregated materialized views for optimal performance. All endpoints support multi-tenant access via the `TenantGuard` and accept the same date filtering options as the Events API.

## Base URL

```
http://localhost:3001/api/insights
```

## Authentication

All endpoints require a valid site key passed via:
- `X-Site-Key` header (preferred)
- `site` query parameter (fallback)

## Date Filters

All endpoints support the following date filtering options:

- `day` - Current day
- `week` - Current week (Sunday to Saturday)
- `month` - Current month
- `year` - Current year
- `custom` - Custom date range (requires `startDate` and `endDate`)

If no date filter is specified, the default is the last 30 days.

## Endpoints

### 1. Overview Analytics

Get high-level analytics including total events, sessions, users, and average time on site.

**Endpoint:** `GET /insights/overview`

**Query Parameters:**
- `dateFilter` (optional): Date filter type
- `startDate` (optional): Start date for custom range (ISO 8601)
- `endDate` (optional): End date for custom range (ISO 8601)

**Example Request:**
```http
GET /api/insights/overview?dateFilter=week
X-Site-Key: sk_5xjk338oj46hcvdqmsj2gfqh
```

**Example Response:**
```json
{
  "totalEvents": 1250,
  "totalSessions": 89,
  "totalUsers": 67,
  "avgTimeOnSite": 145,
  "period": {
    "start": "2024-01-21T00:00:00.000Z",
    "end": "2024-01-27T23:59:59.999Z"
  }
}
```

### 2. Top Events

Get the most frequently triggered events.

**Endpoint:** `GET /insights/top-events`

**Query Parameters:**
- `dateFilter` (optional): Date filter type
- `startDate` (optional): Start date for custom range (ISO 8601)
- `endDate` (optional): End date for custom range (ISO 8601)
- `limit` (optional): Number of results to return (default: 10, max: 100)

**Example Request:**
```http
GET /api/insights/top-events?dateFilter=month&limit=5
X-Site-Key: sk_5xjk338oj46hcvdqmsj2gfqh
```

**Example Response:**
```json
{
  "events": [
    {
      "name": "page_view",
      "count": 450
    },
    {
      "name": "search_filter_city",
      "count": 230
    },
    {
      "name": "search_submit",
      "count": 180
    },
    {
      "name": "property_page_view",
      "count": 95
    },
    {
      "name": "session_start",
      "count": 89
    }
  ]
}
```

### 3. Top Cities

Get the most searched cities.

**Endpoint:** `GET /insights/cities`

**Query Parameters:**
- `dateFilter` (optional): Date filter type
- `startDate` (optional): Start date for custom range (ISO 8601)
- `endDate` (optional): End date for custom range (ISO 8601)
- `limit` (optional): Number of results to return (default: 10, max: 100)

**Example Request:**
```http
GET /api/insights/cities?dateFilter=month&limit=10
X-Site-Key: sk_5xjk338oj46hcvdqmsj2gfqh
```

**Example Response:**
```json
{
  "cities": [
    {
      "city": "são paulo",
      "count": 120
    },
    {
      "city": "rio de janeiro",
      "count": 85
    },
    {
      "city": "belo horizonte",
      "count": 67
    },
    {
      "city": "salvador",
      "count": 45
    },
    {
      "city": "brasília",
      "count": 38
    }
  ]
}
```

### 4. Device Analytics

Get device, operating system, and browser distribution.

**Endpoint:** `GET /insights/devices`

**Query Parameters:**
- `dateFilter` (optional): Date filter type
- `startDate` (optional): Start date for custom range (ISO 8601)
- `endDate` (optional): End date for custom range (ISO 8601)
- `limit` (optional): Number of results to return (default: 10, max: 100)

**Example Request:**
```http
GET /api/insights/devices?dateFilter=month&limit=15
X-Site-Key: sk_5xjk338oj46hcvdqmsj2gfqh
```

**Example Response:**
```json
{
  "devices": [
    {
      "deviceType": "mobile",
      "os": "Android",
      "browser": "Chrome",
      "count": 320
    },
    {
      "deviceType": "desktop",
      "os": "Windows",
      "browser": "Chrome",
      "count": 280
    },
    {
      "deviceType": "mobile",
      "os": "iOS",
      "browser": "Safari",
      "count": 195
    },
    {
      "deviceType": "desktop",
      "os": "macOS",
      "browser": "Chrome",
      "count": 125
    },
    {
      "deviceType": "tablet",
      "os": "iOS",
      "browser": "Safari",
      "count": 45
    }
  ]
}
```

### 5. Admin: Refresh Materialized Views

Refresh materialized views for a specific date range (admin only).

**Endpoint:** `POST /insights/admin/refresh`

**Request Body:**
```json
{
  "fromDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z"
}
```

**Example Request:**
```http
POST /api/insights/admin/refresh
Content-Type: application/json
X-Site-Key: sk_5xjk338oj46hcvdqmsj2gfqh

{
  "fromDate": "2024-01-01T00:00:00Z",
  "toDate": "2024-01-31T23:59:59Z"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Materialized views refreshed from 2024-01-01T00:00:00.000Z to 2024-01-31T23:59:59.000Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Bad request",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Missing site key",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Site not found",
  "error": "Not Found"
}
```

## Performance Notes

- All endpoints use materialized views for optimal performance
- Queries typically complete in under 300ms even with 100k+ events
- Materialized views are refreshed on-demand via the admin endpoint
- Data is aggregated daily for efficient querying

## Data Sources

The insights are derived from the following event types:

- **Overview**: All events, session_start events, user_id properties
- **Top Events**: All event names
- **Top Cities**: search_filter_city and search_filter_changed (field='cidade') events
- **Devices**: User agent strings from event context
