# ManyContact Integration Guide

This guide explains how to integrate ManyContact's WhatsApp Business API with your application.

## Setup

1. **API Authentication**
   - Get your API key from ManyContact's account configuration panel (Settings > Developers)
   - Add to your `.env`:
   ```
   VITE_MANYCONTACT_API_KEY=your-api-key
   VITE_MANYCONTACT_API_URL=https://api.manycontacts.com/v1
   VITE_MANYCONTACT_WHATSAPP_NUMBER=your-whatsapp-number
   ```

## Core Features

### 1. Sending Messages

#### Send WhatsApp Message
```typescript
POST https://api.manycontacts.com/v1/message/text
Headers:
{
  'Content-Type': 'application/json',
  'apikey': 'your-api-key'
}
Body:
{
  "number": "34666860210",  // Without '+' symbol
  "text": "Hello"
}

// Response
{
  "id": "a8cf8c57-6584-426f-bc95-a75729f5df02",
  "error": null
}
```

#### Send Internal Note
```typescript
POST https://api.manycontacts.com/v1/message/note
Headers:
{
  'Content-Type': 'application/json',
  'apikey': 'your-api-key'
}
Body:
{
  "number": "34666860210",
  "text": "Internal note"
}
```

### 2. Contact Management

#### Contact Object Structure
```typescript
interface Contact {
  id: string;              // UUID, unique contact ID
  number: string;          // Phone number with country code, no '+' symbol
  name?: string;           // Optional contact name
  email?: string;         // Optional contact email
  notes?: string;         // Optional notes
  last_user_id?: string;  // Optional ID of assigned user
  open: 0 | 1;            // Conversation status (0=Closed, 1=Open)
  locked: 0 | 1;          // Blocked status (0=Unblocked, 1=Blocked)
  tags?: Array<{          // Optional array of tags
    id: string;
    name: string;
    color: string;
  }>;
  customFields?: {        // Optional custom fields
    [key: string]: string;
  };
}
```

#### List Contacts
```typescript
GET https://api.manycontacts.com/v1/contacts?page=0&filter=1
Headers:
{
  'apikey': 'your-api-key'
}

// Parameters:
// page: Page number (0-based), returns 50 results per page
// filter: 0=Unassigned conversations, 1=All conversations
```

#### Create Contact
```typescript
POST https://api.manycontacts.com/v1/contact
Headers:
{
  'Content-Type': 'application/json',
  'apikey': 'your-api-key'
}
Body:
{
  "number": "34666000003",     // Required
  "name": "Contact Name",      // Optional
  "assigned": "user-uuid"      // Optional
}
```

#### Search Contact by Phone
```typescript
GET https://api.manycontacts.com/v1/contact/phone/:number
Headers:
{
  'apikey': 'your-api-key'
}
```

### 3. Templates (WhatsApp API Only)

#### List Templates
```typescript
GET https://api.manycontacts.com/v1/templates
Headers:
{
  'apikey': 'your-api-key'
}

// Response:
[{
  "name": "example_template",
  "text": "Hello {{1}}, This is a template.",
  "hasImage": 0,
  "hasDocument": 1,
  "hasVideo": 0
}]
```

#### Send Template
```typescript
POST https://api.manycontacts.com/v1/template/{templateName}/{phoneNumber}
Headers:
{
  'Content-Type': 'application/json',
  'apikey': 'your-api-key'
}
Body:
{
  "text": "Variable text"  // Optional, for templates with variables
}
```

### 4. Tags

#### List Tags
```typescript
GET https://api.manycontacts.com/v1/tags
Headers:
{
  'apikey': 'your-api-key'
}
```

#### Add Tag to Contact
```typescript
POST https://api.manycontacts.com/v1/contact/:id/tag/:tagId
Headers:
{
  'apikey': 'your-api-key'
}
```

## Error Handling

The API will return appropriate HTTP status codes and error messages in the response body. Always check the `error` field in responses:

```typescript
{
  "id": "message-or-operation-id",
  "error": null | string
}
```

## Best Practices

1. Always format phone numbers to remove any non-digit characters and the '+' symbol
2. Include error handling for API calls
3. Use templates when available for consistent messaging
4. Check contact existence before sending messages
5. Log API responses for debugging

## Webhooks

Enable webhooks in the Developers section to receive real-time updates.

### Available Events:
1. **Contact Events**
   - `contact_update`: Basic info changes
   - `contact_update_custom_fields`: Custom field changes
   - `contact_update_tag_added`: Tag added
   - `contact_update_tag_deleted`: Tag removed
   - `contact_created`: New contact
   - `mediafile_new`: New attachment
   - `message_new`: New incoming message

### Webhook Format
```typescript
{
    "event": "event_name",
    "delta": {
        // Changed fields
    },
    "contact": {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "number": "string",
        "notes": "string",
        "open": 0|1,
        "locked": 0|1,
        "last_user_id": "uuid",
        "customFields": {},
        "tags": []
    }
}
```

## VoIP Integration

ManyContact supports Zadarma for direct calling:

1. Create Zadarma account (www.zadarma.com)
2. Certify caller ID
3. Configure in ManyContact settings

## Support Resources

- [ManyContact API Documentation](https://manycontacts.notion.site/Integrations)
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Zadarma API Documentation](https://zadarma.com/en/support/api/)
