# Get Customers API Endpoint

## Overview
This endpoint allows admin users (franchise group members) to retrieve a list of customers from the Cognito User Pool.

## Endpoint Details
- **URL**: `GET /customers`
- **Authorization**: Admin/Franchise users only
- **Content-Type**: `application/json`

## Request Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## Query Parameters
- `limit` (optional): Number of users to return (default: 60, max: 60)
- `paginationToken` (optional): Token for paginating through results
- `group` (optional): Filter users by group ('customers', 'franchise', 'all'). Default: 'customers'

## Example Requests

### Get all customers (default)
```bash
curl -X GET "https://your-api-gateway-url/prod/customers" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

### Get customers with pagination
```bash
curl -X GET "https://your-api-gateway-url/prod/customers?limit=20&group=customers" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

### Get all users (customers and franchise)
```bash
curl -X GET "https://your-api-gateway-url/prod/customers?group=all" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "users": [
    {
      "userId": "uuid-string",
      "username": "user@example.com",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userStatus": "CONFIRMED",
      "enabled": true,
      "userCreateDate": "2025-01-12T10:30:00.000Z",
      "userLastModifiedDate": "2025-01-12T10:30:00.000Z",
      "emailVerified": true,
      "groups": ["customers"]
    }
  ],
  "totalCount": 1,
  "limit": 60,
  "nextPaginationToken": "optional-pagination-token"
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

#### 403 Forbidden (Non-admin user)
```json
{
  "message": "User is not in the franchise group"
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve users"
}
```

## User Fields Explanation
- `userId`: Unique identifier (Cognito sub)
- `username`: Username (usually email)
- `email`: User's email address
- `firstName`: User's first name
- `lastName`: User's last name
- `userStatus`: Cognito user status (CONFIRMED, UNCONFIRMED, etc.)
- `enabled`: Whether the user account is enabled
- `userCreateDate`: When the user was created
- `userLastModifiedDate`: When the user was last modified
- `emailVerified`: Whether the email is verified
- `groups`: List of groups the user belongs to

## Authorization Requirements
- Only users in the 'franchise' group can access this endpoint
- Valid JWT token required in Authorization header
- Token must not be expired

## Rate Limiting
AWS Cognito has built-in rate limiting. If you encounter 429 errors, implement exponential backoff in your client application.

## Deployment
This endpoint is automatically deployed when you apply the Terraform configuration. Make sure to:

1. Deploy the Lambda function
2. Deploy the API Gateway configuration
3. Ensure proper IAM permissions are in place

## Security Notes
- This endpoint exposes user information and should only be accessible to authorized admin users
- Ensure JWT tokens are properly validated
- Consider implementing additional logging for audit purposes
