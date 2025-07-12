# API Gateway Authorizers Usage Guide

This guide explains how to use the role-based authorizers (`customer_authorizer` and `franchise_authorizer`) that have been configured in your API Gateway.

## Available Authorizers

### 1. Customer Authorizer
- **Name**: `customer_authorizer`
- **Purpose**: Validates JWT tokens and allows access for users in `customers` or `franchise` groups
- **Lambda Function**: `aws_lambda_function.customer_authenticator`

### 2. Franchise Authorizer
- **Name**: `franchise_authorizer` 
- **Purpose**: Validates JWT tokens and allows access ONLY for users in `franchise` group
- **Lambda Function**: `aws_lambda_function.admin_authenticator`

## How to Use Authorizers for New API Endpoints

### Step 1: Create API Gateway Resource
```terraform
resource "aws_api_gateway_resource" "your_endpoint" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  parent_id   = aws_api_gateway_rest_api.registration_api.root_resource_id
  path_part   = "your-endpoint-name"
}
```

### Step 2: Create Method with Authorization

#### For Customer-Only Endpoint:
```terraform
resource "aws_api_gateway_method" "your_endpoint_method" {
  rest_api_id   = aws_api_gateway_rest_api.registration_api.id
  resource_id   = aws_api_gateway_resource.your_endpoint.id
  http_method   = "GET"  # or POST, PUT, DELETE, etc.
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.customer_authorizer.id
}
```

#### For Franchise-Only Endpoint:
```terraform
resource "aws_api_gateway_method" "your_endpoint_method" {
  rest_api_id   = aws_api_gateway_rest_api.registration_api.id
  resource_id   = aws_api_gateway_resource.your_endpoint.id
  http_method   = "GET"  # or POST, PUT, DELETE, etc.
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id
}
```

### Step 3: Create Integration (Connect to your Lambda function)
```terraform
resource "aws_api_gateway_integration" "your_endpoint_integration" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.your_endpoint.id
  http_method = aws_api_gateway_method.your_endpoint_method.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.your_lambda_function.invoke_arn
}
```

### Step 4: Add Method and Integration Responses (Optional but recommended)
```terraform
resource "aws_api_gateway_method_response" "your_endpoint_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.your_endpoint.id
  http_method = aws_api_gateway_method.your_endpoint_method.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "your_endpoint_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.your_endpoint.id
  http_method = aws_api_gateway_method.your_endpoint_method.http_method
  status_code = aws_api_gateway_method_response.your_endpoint_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.your_endpoint_integration]
}
```

### Step 5: Add Lambda Permission
```terraform
resource "aws_lambda_permission" "api_gateway_invoke_your_function" {
  statement_id  = "AllowAPIGatewayInvokeYourFunction"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.your_lambda_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.registration_api.execution_arn}/*/*"
}
```

### Step 6: Update API Gateway Deployment
Add your new method and integration to the deployment dependencies:

```terraform
resource "aws_api_gateway_deployment" "registration_deployment" {
  depends_on = [
    aws_api_gateway_method.register_post,
    aws_api_gateway_integration.register_integration,
    aws_api_gateway_method.admin_post,
    aws_api_gateway_integration.admin_integration,
    aws_api_gateway_method.admin_options,
    aws_api_gateway_integration.admin_options_integration,
    # Add your new endpoint here:
    aws_api_gateway_method.your_endpoint_method,
    aws_api_gateway_integration.your_endpoint_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  stage_name  = "prod"
  
  lifecycle {
    create_before_destroy = true
  }
}
```

## Client-Side Usage

### Making Authenticated Requests
When calling protected endpoints from your frontend, include the JWT token in the Authorization header:

```javascript
// Get the JWT token from your authentication flow
const token = "your-jwt-token-here";

// Make API call with Authorization header
const response = await fetch('your-api-endpoint-url', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Token Context Available in Lambda Functions

When a request is successfully authorized, the authorizer adds user context that your Lambda functions can access:

```python
def lambda_handler(event, context):
    # Access user information passed by the authorizer
    authorizer_context = event.get('requestContext', {}).get('authorizer', {})
    
    user_id = authorizer_context.get('userId')
    user_email = authorizer_context.get('email')
    user_groups = authorizer_context.get('groups', '').split(',')
    
    # Your business logic here
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': f'Hello {user_email}!',
            'userId': user_id,
            'groups': user_groups
        })
    }
```

## Role Differences

- **Customer Authorizer**: Allows access for both `customers` and `franchise` groups
- **Franchise Authorizer**: Allows access ONLY for `franchise` group (admin-only endpoints)

Choose the appropriate authorizer based on your endpoint's access requirements.
