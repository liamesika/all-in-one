# Real Estate APIs - Quick Testing Reference

## Prerequisites

```bash
# Set your organization ID
export ORG_ID="your-org-id-here"

# API Base URL
export API_URL="http://localhost:3000/api"
```

---

## 1. Calendar Events API

### Get All Events (January 2025)
```bash
curl -X GET "$API_URL/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31" \
  -H "x-org-id: $ORG_ID" \
  | jq
```

### Get Property Viewings Only
```bash
curl -X GET "$API_URL/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31&eventTypes=property_viewing" \
  -H "x-org-id: $ORG_ID" \
  | jq
```

### Get Multiple Event Types
```bash
curl -X GET "$API_URL/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31&eventTypes=property_viewing,follow_up,deadline" \
  -H "x-org-id: $ORG_ID" \
  | jq
```

### Next 7 Days (Dynamic)
```bash
START=$(date -u +"%Y-%m-%d")
END=$(date -u -v+7d +"%Y-%m-%d")
curl -X GET "$API_URL/real-estate/calendar/events?startDate=$START&endDate=$END" \
  -H "x-org-id: $ORG_ID" \
  | jq
```

### Expected Response
```json
[
  {
    "id": "viewing-cuid123",
    "title": "Property Viewing: Beautiful Apartment",
    "type": "property_viewing",
    "date": "2025-01-15T10:00:00.000Z",
    "status": "scheduled",
    "propertyId": "prop123",
    "propertyName": "Beautiful Apartment",
    "leadId": "lead456",
    "leadName": "John Doe",
    "notes": "Viewing scheduled for John Doe"
  },
  {
    "id": "followup-cuid789",
    "title": "Follow up with Jane Smith",
    "type": "follow_up",
    "date": "2025-01-16T14:00:00.000Z",
    "status": "pending",
    "leadId": "lead789",
    "leadName": "Jane Smith",
    "notes": "Follow up required for Jane Smith"
  }
]
```

---

## 2. Enhanced Leads API

### Get Leads (Default - No Property Count)
```bash
curl -X GET "$API_URL/real-estate/leads" \
  -H "x-org-id: $ORG_ID" \
  | jq
```

### Get Leads with Property Count
```bash
curl -X GET "$API_URL/real-estate/leads?includePropertyCount=true" \
  -H "x-org-id: $ORG_ID" \
  | jq
```

### Search Leads with Property Count
```bash
curl -X GET "$API_URL/real-estate/leads?q=john&includePropertyCount=true" \
  -H "x-org-id: $ORG_ID" \
  | jq
```

### Filter by Status with Property Count
```bash
curl -X GET "$API_URL/real-estate/leads?status=NEW&includePropertyCount=true" \
  -H "x-org-id: $ORG_ID" \
  | jq
```

### Expected Response (with includePropertyCount=true)
```json
[
  {
    "id": "lead123",
    "ownerUid": "org123",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "message": "Interested in the apartment",
    "propertyId": "prop456",
    "property": {
      "id": "prop456",
      "name": "Beautiful Apartment"
    },
    "_count": {
      "properties": 1
    },
    "createdAt": "2025-01-10T12:00:00.000Z",
    "updatedAt": "2025-01-10T12:00:00.000Z"
  },
  {
    "id": "lead789",
    "ownerUid": "org123",
    "fullName": "Jane Smith",
    "phone": "+0987654321",
    "email": "jane@example.com",
    "propertyId": null,
    "property": null,
    "_count": {
      "properties": 0
    },
    "createdAt": "2025-01-11T14:30:00.000Z",
    "updatedAt": "2025-01-11T14:30:00.000Z"
  }
]
```

---

## Error Testing

### Missing x-org-id Header
```bash
curl -X GET "$API_URL/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31"
# Expected: 400 Bad Request
```

### Invalid Date Format
```bash
curl -X GET "$API_URL/real-estate/calendar/events?startDate=invalid&endDate=2025-01-31" \
  -H "x-org-id: $ORG_ID"
# Expected: 400 Bad Request
```

### Invalid Event Type
```bash
curl -X GET "$API_URL/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31&eventTypes=invalid_type" \
  -H "x-org-id: $ORG_ID"
# Expected: 400 Bad Request
```

### End Date Before Start Date
```bash
curl -X GET "$API_URL/real-estate/calendar/events?startDate=2025-01-31&endDate=2025-01-01" \
  -H "x-org-id: $ORG_ID"
# Expected: 400 Bad Request
```

---

## Performance Testing

### Large Date Range
```bash
curl -X GET "$API_URL/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-12-31" \
  -H "x-org-id: $ORG_ID" \
  -w "\nTime: %{time_total}s\n"
```

### Leads with Large Result Set
```bash
curl -X GET "$API_URL/real-estate/leads?limit=1000&includePropertyCount=true" \
  -H "x-org-id: $ORG_ID" \
  -w "\nTime: %{time_total}s\n"
```

---

## Automation Script

Save this as `test-real-estate-apis.sh`:

```bash
#!/bin/bash

# Configuration
ORG_ID="${ORG_ID:-your-org-id-here}"
API_URL="${API_URL:-http://localhost:3000/api}"

echo "==================================="
echo "Real Estate APIs Testing Script"
echo "==================================="
echo ""

# Test 1: Calendar Events - All Types
echo "Test 1: Calendar Events (All Types)"
curl -s -X GET "$API_URL/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31" \
  -H "x-org-id: $ORG_ID" | jq -r 'length as $len | "Found \($len) events"'
echo ""

# Test 2: Calendar Events - Property Viewings Only
echo "Test 2: Calendar Events (Property Viewings Only)"
curl -s -X GET "$API_URL/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31&eventTypes=property_viewing" \
  -H "x-org-id: $ORG_ID" | jq -r 'length as $len | "Found \($len) property viewing events"'
echo ""

# Test 3: Leads without Property Count
echo "Test 3: Leads (Default)"
curl -s -X GET "$API_URL/real-estate/leads?limit=10" \
  -H "x-org-id: $ORG_ID" | jq -r 'length as $len | "Found \($len) leads"'
echo ""

# Test 4: Leads with Property Count
echo "Test 4: Leads (With Property Count)"
curl -s -X GET "$API_URL/real-estate/leads?limit=10&includePropertyCount=true" \
  -H "x-org-id: $ORG_ID" | jq -r 'length as $len | "Found \($len) leads with property counts"'
echo ""

# Test 5: Error Handling - Missing Header
echo "Test 5: Error Handling (Missing x-org-id)"
curl -s -X GET "$API_URL/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31" \
  | jq -r '.statusCode // "No error code"'
echo ""

# Test 6: Error Handling - Invalid Date
echo "Test 6: Error Handling (Invalid Date)"
curl -s -X GET "$API_URL/real-estate/calendar/events?startDate=invalid&endDate=2025-01-31" \
  -H "x-org-id: $ORG_ID" | jq -r '.message // "No error message"'
echo ""

echo "==================================="
echo "Testing Complete"
echo "==================================="
```

Make it executable:
```bash
chmod +x test-real-estate-apis.sh
./test-real-estate-apis.sh
```

---

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Real Estate APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "orgId",
      "value": "your-org-id-here"
    }
  ],
  "item": [
    {
      "name": "Calendar Events",
      "item": [
        {
          "name": "Get All Events",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "x-org-id",
                "value": "{{orgId}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31",
              "host": ["{{baseUrl}}"],
              "path": ["real-estate", "calendar", "events"],
              "query": [
                {
                  "key": "startDate",
                  "value": "2025-01-01"
                },
                {
                  "key": "endDate",
                  "value": "2025-01-31"
                }
              ]
            }
          }
        },
        {
          "name": "Get Property Viewings",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "x-org-id",
                "value": "{{orgId}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/real-estate/calendar/events?startDate=2025-01-01&endDate=2025-01-31&eventTypes=property_viewing",
              "host": ["{{baseUrl}}"],
              "path": ["real-estate", "calendar", "events"],
              "query": [
                {
                  "key": "startDate",
                  "value": "2025-01-01"
                },
                {
                  "key": "endDate",
                  "value": "2025-01-31"
                },
                {
                  "key": "eventTypes",
                  "value": "property_viewing"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Leads",
      "item": [
        {
          "name": "Get Leads (Default)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "x-org-id",
                "value": "{{orgId}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/real-estate/leads",
              "host": ["{{baseUrl}}"],
              "path": ["real-estate", "leads"]
            }
          }
        },
        {
          "name": "Get Leads with Property Count",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "x-org-id",
                "value": "{{orgId}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/real-estate/leads?includePropertyCount=true",
              "host": ["{{baseUrl}}"],
              "path": ["real-estate", "leads"],
              "query": [
                {
                  "key": "includePropertyCount",
                  "value": "true"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue: Empty Calendar Events
**Solution**: Ensure you have:
- Properties in database for `deadline` and `task_due` events
- RealEstateLeads in database for `property_viewing` and `follow_up` events
- Date range overlaps with generated event dates

### Issue: Property Count Always 0
**Solution**:
- Check if leads have `propertyId` set
- Verify properties exist in database
- Confirm ownerUid matches

### Issue: "Organization ID is required"
**Solution**:
- Add `x-org-id` header to all requests
- Verify auth middleware is running
- Check header name is lowercase

### Issue: Slow Response Times
**Solution**:
- Reduce date range (use shorter periods)
- Add database indexes on `ownerUid`, `createdAt`, `updatedAt`
- Enable query logging to identify slow queries
- Consider caching for frequently accessed date ranges

---

## Database Queries to Verify Data

```sql
-- Check RealEstateLeads
SELECT COUNT(*) FROM "RealEstateLead" WHERE "ownerUid" = 'your-org-id';

-- Check Properties
SELECT COUNT(*) FROM "Property" WHERE "ownerUid" = 'your-org-id';

-- Check Leads with Properties
SELECT COUNT(*) FROM "RealEstateLead"
WHERE "ownerUid" = 'your-org-id'
AND "propertyId" IS NOT NULL;

-- Check Recent Leads (for event generation)
SELECT * FROM "RealEstateLead"
WHERE "ownerUid" = 'your-org-id'
ORDER BY "createdAt" DESC
LIMIT 10;

-- Check Recent Properties (for event generation)
SELECT * FROM "Property"
WHERE "ownerUid" = 'your-org-id'
ORDER BY "updatedAt" DESC
LIMIT 10;
```

---

## Next Steps After Testing

1. Integrate with frontend Calendar component
2. Add unit tests for service layer
3. Add e2e tests for API endpoints
4. Set up monitoring and alerting
5. Configure rate limiting
6. Add caching for frequently accessed date ranges
7. Document frontend integration examples

---

**Quick Reference Version**: 1.0
**Last Updated**: 2025-10-18
