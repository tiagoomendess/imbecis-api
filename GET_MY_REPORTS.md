# GET /reports/mine

Returns a paginated list of reports submitted by the calling device, ordered by most recent occurrence first. Includes reports in all lifecycle statuses except soft-deleted ones.

## Request

```
GET /reports/mine
```

### Headers

| Header        | Required | Description                                                                 |
|---------------|----------|-----------------------------------------------------------------------------|
| `device-uuid` | Yes      | The UUID v4 that identifies the calling device. Returns `400` if missing or not a valid UUID v4. |

### Query Parameters

| Parameter  | Type    | Required | Default | Constraints | Description              |
|------------|---------|----------|---------|-------------|--------------------------|
| `page`     | integer | No       | `1`     | ≥ 1         | Page number.             |
| `pageSize` | integer | No       | `10`    | 5 – 50      | Number of results per page. |

### Example Requests

Fetch the first page with default settings:
```
GET /reports/mine
device-uuid: d7936a66-53a3-425b-891e-d606680db5f6
```

Fetch page 3 with 25 results per page:
```
GET /reports/mine?page=3&pageSize=25
device-uuid: d7936a66-53a3-425b-891e-d606680db5f6
```

Using curl:
```bash
curl http://localhost:3000/reports/mine \
  -H "device-uuid: d7936a66-53a3-425b-891e-d606680db5f6"
```

## Response

**HTTP 200 OK**

```json
{
    "success": true,
    "message": "My reports",
    "meta": {
        "page": 1,
        "pageSize": 10,
        "total": 3,
        "totalPages": 1
    },
    "payload": [
        {
            "id": "69f3a084f3a164e5562c4d20",
            "picture": "https://cdn.imbecis.app/pictures/reports/1d455bfc-0a8c-41f5-ace4-8fd3f8b1180c.webp",
            "status": "confirmed",
            "municipality": "Braga",
            "occurredAt": "2026-04-30T14:22:00.000Z"
        },
        {
            "id": "69f3a084f3a164e5562c4d21",
            "picture": null,
            "status": "new",
            "municipality": null,
            "occurredAt": "2026-04-30T14:10:00.000Z"
        }
    ]
}
```

### Response Fields

#### Top-level

| Field     | Type    | Description                             |
|-----------|---------|-----------------------------------------|
| `success` | boolean | Always `true` on a successful response. |
| `message` | string  | Human-readable status message.          |
| `meta`    | object  | Pagination metadata (see below).        |
| `payload` | array   | List of report objects for this device. |

#### `meta`

| Field        | Type    | Description                                      |
|--------------|---------|--------------------------------------------------|
| `page`       | integer | Current page number.                             |
| `pageSize`   | integer | Number of items per page used for this response. |
| `total`      | integer | Total number of reports for this device.         |
| `totalPages` | integer | Total number of pages. `0` when `total` is `0`. |

#### Report item (`payload[]`)

| Field          | Type           | Description                                                                                                    |
|----------------|----------------|----------------------------------------------------------------------------------------------------------------|
| `id`           | string         | MongoDB ObjectId of the report as a hex string.                                                                |
| `picture`      | string \| null | Public CDN URL of the report image. `null` if no picture has been uploaded yet.                               |
| `status`       | string         | Current lifecycle status of the report (see status reference below).                                           |
| `municipality` | string \| null | Municipality where the report was filed. `null` for reports that have not yet been through geolocation enrichment. |
| `occurredAt`   | string         | ISO 8601 date-time of when the infraction was witnessed. Falls back to `createdAt` for older reports that pre-date that field. |

#### Status reference

| Status                     | Meaning                                                                        |
|----------------------------|--------------------------------------------------------------------------------|
| `new`                      | Report just submitted, awaiting processing.                                    |
| `fill_geo_info`            | Geolocation enrichment in progress.                                            |
| `review`                   | Open for community voting.                                                     |
| `confirmed_blur_plates`    | Approved by votes; plate-blurring in progress.                                 |
| `notify`                   | Notifications being dispatched.                                                |
| `confirmed`                | Publicly confirmed and visible.                                                |
| `confirmed_manual_verify`  | Flagged for manual review before final publication.                            |
| `rejected`                 | Rejected by community vote.                                                    |

## Error Responses

**HTTP 400 Bad Request** — returned when the header or query parameters fail validation.

```json
{
    "success": false,
    "errors": [
        "An instance of ListMyReportsRequest has failed the validation:\n - property deviceUUID has failed the following constraints: isUuid"
    ]
}
```

Common validation errors:

| Condition                          | Error message                              |
|------------------------------------|--------------------------------------------|
| `device-uuid` header missing       | `deviceUUID is invalid`                    |
| `device-uuid` is not a UUID v4     | `deviceUUID is invalid`                    |
| `page` < 1                         | `page must not be less than 1`             |
| `pageSize` outside 5 – 50          | `pageSize must not be less than 5` / `must not be greater than 50` |

## Notes

- **Identity**: the device is identified solely by the `device-uuid` header. There is no user account or token — the UUID is the caller's pseudo-identity, the same one used when submitting reports and voting.
- **Ordering**: results are sorted by `occurredAt` descending. Reports that pre-date the `occurredAt` field fall back to `createdAt` for sorting purposes.
- **Soft-deleted reports**: reports with status `removed` are excluded and will never appear in this response.
- **Historical reports**: reports submitted before a certain date may not appear here if they were confirmed or rejected prior to a platform update that preserved `deviceUUID` through status transitions. This is expected behaviour and affects only older records.
- **Authentication**: this endpoint is public and requires no credentials beyond the `device-uuid` header.
