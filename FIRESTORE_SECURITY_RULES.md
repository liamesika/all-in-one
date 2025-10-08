# Firestore Security Rules

This document contains the security rules for Firestore user profiles.

## Rules to Apply in Firebase Console

Go to: https://console.firebase.google.com/project/all-in-one-eed0a/firestore/rules

Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile collection
    match /users/{userId} {
      // Users can only read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;

      // Users can create their own profile during registration
      // Only allow if the document doesn't exist yet
      allow create: if request.auth != null
                    && request.auth.uid == userId
                    && !exists(/databases/$(database)/documents/users/$(userId));

      // Users can update their own profile
      // But can't change uid, email, createdAt
      allow update: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.data.uid == userId
                    && request.resource.data.email == resource.data.email
                    && request.resource.data.createdAt == resource.data.createdAt;

      // Don't allow deletion of profiles
      allow delete: if false;
    }

    // Admin-only collections (for future use)
    match /admin/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.token.admin == true;
    }

    // Deny access to all other collections by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## User Profile Schema

Each document in the `users` collection should have:

```typescript
{
  uid: string;              // Firebase UID (same as document ID)
  email: string;            // User's email
  fullName: string;         // User's display name
  vertical: string;         // User's selected vertical (REAL_ESTATE, E_COMMERCE, LAW, PRODUCTION)
  lang: string;             // Preferred language (en, he)
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
}
```

**Note:** Effinity does not use user plan types (basic/premium). All users have the same access level.

## Testing the Rules

After applying the rules, test them using the Firebase Console Rules Playground:

1. Go to Firestore → Rules → Playground
2. Test scenarios:
   - **Read own profile**: Should ALLOW
     - Location: `/users/{your-uid}`
     - Auth UID: `{your-uid}`
   - **Read other's profile**: Should DENY
     - Location: `/users/{other-uid}`
     - Auth UID: `{your-uid}`
   - **Create own profile**: Should ALLOW (first time only)
   - **Update own profile**: Should ALLOW
   - **Delete profile**: Should DENY

## Notes

- These rules enforce that users can only access their own data
- Profiles can only be created once (prevents accidental overwrites)
- Email and UID cannot be changed after creation
- Profile deletion is disabled for data retention

## Future Enhancements

Consider adding:
- Admin role for support team access
- Shared organization data access
- Team member permissions
- Audit logging for profile changes
