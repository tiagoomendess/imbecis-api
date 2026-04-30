# GET /reports/confirmed

Returns a paginated list of publicly confirmed reports, ordered by most recent occurrence first.

## Request

```
GET /reports/confirmed
```

### Query Parameters

| Parameter      | Type    | Required | Default | Constraints                              | Description                                                                                   |
|----------------|---------|----------|---------|------------------------------------------|-----------------------------------------------------------------------------------------------|
| `page`         | integer | No       | `1`     | ≥ 1                                      | Page number.                                                                                  |
| `pageSize`     | integer | No       | `10`    | 5 – 50                                   | Number of results per page.                                                                   |
| `from_time`    | string  | No       | —       | ISO 8601 date-time                       | Lower bound filter on occurrence time. Applies to `occurredAt`, falling back to `createdAt` for older reports that pre-date that field. |
| `to_time`      | string  | No       | —       | ISO 8601 date-time, ≥ `from_time`        | Upper bound filter on occurrence time. Same fallback logic as `from_time`.                    |
| `municipality` | string  | No       | —       | Must be a valid Portuguese municipality  | Filters by the top-level `municipality` field on the report (populated from reverse geocoding). |

### Example Requests

Fetch the first page with default settings:
```
GET /reports/confirmed
```

Fetch page 2 with 25 results per page, filtered to Braga:
```
GET /reports/confirmed?page=2&pageSize=25&municipality=Braga
```

Fetch reports that occurred within a specific time window:
```
GET /reports/confirmed?from_time=2026-04-01T00:00:00.000Z&to_time=2026-04-30T23:59:59.999Z
```

## Response

**HTTP 200 OK**

```json
{
    "success": true,
    "message": "Confirmed reports",
    "meta": {
        "page": 1,
        "pageSize": 10,
        "total": 84,
        "totalPages": 9
    },
    "payload": [
        {
            "id": "69f3a084f3a164e5562c4d20",
            "occurredAt": "2026-04-30T14:22:00.000Z",
            "createdAt": "2026-04-30T14:23:11.000Z",
            "picture": "https://cdn.imbecis.app/reports/69f3a084f3a164e5562c4d20.jpg",
            "plateNumber": "AA-00-BB",
            "plateCountry": "pt",
            "location": {
                "latitude": 41.54321,
                "longitude": -8.42109,
                "municipality": "Braga",
                "freguesia": "Maximinos",
                "street": "Rua de Santa Margarida",
                "doorNumber": 12,
                "postal_code": "4710-306"
            }
        }
    ]
}
```

### Response Fields

#### Top-level

| Field     | Type    | Description                            |
|-----------|---------|----------------------------------------|
| `success` | boolean | Always `true` on a successful response. |
| `message` | string  | Human-readable status message.          |
| `meta`    | object  | Pagination metadata (see below).        |
| `payload` | array   | List of confirmed report objects.       |

#### `meta`

| Field        | Type    | Description                                      |
|--------------|---------|--------------------------------------------------|
| `page`       | integer | Current page number.                             |
| `pageSize`   | integer | Number of items per page used for this response. |
| `total`      | integer | Total number of matching reports.                |
| `totalPages` | integer | Total number of pages. `0` when `total` is `0`. |

#### Report item (`payload[]`)

| Field          | Type           | Description                                                                                  |
|----------------|----------------|----------------------------------------------------------------------------------------------|
| `id`           | string         | MongoDB ObjectId of the report as a hex string.                                              |
| `occurredAt`   | string         | ISO 8601 date-time of when the infraction was witnessed. Falls back to `createdAt` for older reports. |
| `createdAt`    | string         | ISO 8601 date-time of when the report was submitted.                                         |
| `picture`      | string \| null | Public CDN URL of the (plate-blurred) image. `null` if no picture is attached.              |
| `plateNumber`  | string \| null | Licence plate number. `null` if no plate was confirmed for this report.                     |
| `plateCountry` | string \| null | ISO country code of the plate (e.g. `"pt"`). `null` if no plate was confirmed.             |
| `location`     | object         | Location details (see below).                                                                |

#### `location`

| Field          | Type            | Description                                                       |
|----------------|-----------------|-------------------------------------------------------------------|
| `latitude`     | number          | Latitude, rounded to 5 decimal places.                            |
| `longitude`    | number          | Longitude, rounded to 5 decimal places.                           |
| `municipality` | string \| undefined | Municipality name (from reverse geocoding).                   |
| `freguesia`    | string \| undefined | Parish name.                                                  |
| `street`       | string \| undefined | Street name.                                                  |
| `doorNumber`   | integer \| undefined | Door/building number.                                        |
| `postal_code`  | string \| undefined | Postal code (e.g. `"4710-306"`).                             |

## Error Responses

**HTTP 400 Bad Request** — returned when query parameters fail validation.

```json
{
    "success": false,
    "errors": [
        "pageSize must not be less than 5",
        "municipality is not a valid municipality"
    ]
}
```

Common validation errors:

| Condition                              | Error message                                           |
|----------------------------------------|---------------------------------------------------------|
| `page` < 1                             | `page must not be less than 1`                          |
| `pageSize` outside 5 – 50              | `pageSize must not be less than 5` / `must not be greater than 50` |
| `from_time` is not a valid ISO string  | `from_time must be a valid ISO date string`             |
| `to_time` is not a valid ISO string    | `to_time must be a valid ISO date string`               |
| `from_time` > `to_time`               | `from_time must be earlier than or equal to to_time`    |
| `municipality` not in allowed list     | `municipality is not a valid municipality`              |

## Notes

- **Ordering**: results are sorted by `occurredAt` descending. Reports that pre-date the `occurredAt` field fall back to `createdAt` for sorting purposes — they will appear after more recent reports that carry an explicit `occurredAt`.
- **`municipality` filter**: matches the root-level `municipality` field on each report, which is populated automatically from reverse geocoding when the report is processed. It does not search inside the detailed `geoInfo` sub-document.
- **Geo fields**: `municipality`, `freguesia`, `street`, `doorNumber`, and `postal_code` inside `location` are omitted from the JSON response when not available (reports that have not yet been enriched with geolocation data, or where the geocoding service returned no result for those fields).
- **Authentication**: this endpoint is public and requires no credentials.
