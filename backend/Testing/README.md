# Role-Based Authorizers for DalScooter

This implementation adds two AWS Lambda authorizers to the DalScooter API Gateway to enforce role-based access control for customer and franchise users.

## Overview

### Authorizers Created:
1. **Customer Authorizer** - Allows access to users in 'customers' or 'franchise' groups
2. **Franchise Authorizer** - Restricts access to users only in the 'franchise' group

### Test Endpoints Created:
1. **GET /customer-test** - Protected by Customer Authorizer
2. **GET /franchise-test** - Protected by Franchise Authorizer

## Architecture

```
User Request → API Gateway → Lambda Authorizer → Target Lambda Function
```

### Components:

1. **Lambda Authorizers**:
   - `customer_authenticator_simple.py` - Validates JWT tokens for customer access
   - `admin_authenticator_simple.py` - Validates JWT tokens for franchise access

2. **Test Lambda Functions**:
   - `customer_test.py` - Simple endpoint returning customer-specific data
   - `franchise_test.py` - Simple endpoint returning franchise-specific data

3. **API Gateway Resources**:
   - Custom authorizers attached to specific endpoints
   - CORS-enabled responses
   - Proper IAM roles and permissions

## How It Works

### Authentication Flow:
1. User authenticates with Cognito and receives a JWT token
2. User makes request to protected endpoint with `Authorization: Bearer <token>` header
3. API Gateway calls the appropriate Lambda authorizer
4. Authorizer validates the JWT token and checks user groups
5. If authorized, request proceeds to the target Lambda function
6. Target function receives user context from authorizer

### Token Validation:
- JWT token signature validation (simplified for demo)
- Token expiration check
- Audience (client ID) verification
- User group membership validation

## Deployment

The infrastructure is defined in Terraform:

### Files Modified/Created:
- `infrastructure/ApiGateway.tf` - Added authorizers and test endpoints
- `infrastructure/Authentication.tf` - Added Lambda functions for authorizers and tests
- `backend/User Management/customer_authenticator_simple.py` - Customer authorizer
- `backend/User Management/admin_authenticator_simple.py` - Franchise authorizer
- `backend/Testing/customer_test.py` - Customer test endpoint
- `backend/Testing/franchise_test.py` - Franchise test endpoint

### Deploy with Terraform:
```bash
cd infrastructure
terraform plan
terraform apply
```

## Testing

### Manual Testing:
1. Get a JWT token from Cognito authentication
2. Make requests to the test endpoints:

```bash
# Test customer endpoint (requires customer or franchise role)
curl -X GET "https://your-api-gateway-url/prod/customer-test" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test franchise endpoint (requires franchise role only)
curl -X GET "https://your-api-gateway-url/prod/franchise-test" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Expected Responses:

**Customer Test Endpoint** (successful):
```json
{
  "message": "Customer endpoint accessed successfully!",
  "user_id": "user-uuid",
  "email": "user@example.com",
  "groups": "customers",
  "timestamp": "request-id"
}
```

**Franchise Test Endpoint** (successful):
```json
{
  "message": "Franchise endpoint accessed successfully!",
  "user_id": "user-uuid",
  "email": "admin@example.com",
  "groups": "franchise",
  "admin_privileges": true,
  "timestamp": "request-id"
}
```

**Unauthorized Response**:
```json
{
  "message": "Unauthorized"
}
```

## Security Considerations

### Current Implementation (Demo):
- Uses simplified JWT validation without full signature verification
- Suitable for development and testing

### Production Recommendations:
1. Implement full JWT signature verification using Cognito JWKS
2. Add rate limiting
3. Implement token caching for performance
4. Add comprehensive logging and monitoring
5. Use AWS Lambda layers for shared dependencies

## Extending the Implementation

### Adding New Roles:
1. Create new Cognito user groups
2. Create new Lambda authorizer functions
3. Add new API Gateway authorizers
4. Attach authorizers to relevant endpoints

### Adding New Protected Endpoints:
1. Create new Lambda function for business logic
2. Add API Gateway resource and method
3. Attach appropriate authorizer
4. Configure CORS and permissions

## Notes

- The simple authenticators use basic JWT payload decoding for demonstration
- In production, use proper JWT libraries with signature verification
- User context is passed from authorizer to target Lambda function
- All endpoints include CORS headers for frontend integration
