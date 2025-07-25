# ================================
# BIKE INVENTORY API GATEWAY ENDPOINTS
# ================================

# ================================
# BIKE MANAGEMENT ENDPOINTS
# ================================

# API Gateway Resource for Bike Management
resource "aws_api_gateway_resource" "bikes" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "bikes"
}

# API Gateway Resource for specific bike operations
resource "aws_api_gateway_resource" "bike_by_id" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_resource.bikes.id
  path_part   = "{bikeId}"
}

# GET method for retrieving bikes (Admin only)
resource "aws_api_gateway_method" "bikes_get" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.bikes.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id

  request_parameters = {
    "method.request.querystring.bikeType"    = false
    "method.request.querystring.status"      = false
    "method.request.querystring.franchiseId" = false
  }
}

# POST method for adding bikes (Admin only)
resource "aws_api_gateway_method" "bikes_post" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.bikes.id
  http_method   = "POST"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id
}

# PUT method for updating bikes (Admin only)
resource "aws_api_gateway_method" "bike_put" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.bike_by_id.id
  http_method   = "PUT"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id

  request_parameters = {
    "method.request.path.bikeId" = true
  }
}

# DELETE method for removing bikes (Admin only)
resource "aws_api_gateway_method" "bike_delete" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.bike_by_id.id
  http_method   = "DELETE"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id

  request_parameters = {
    "method.request.path.bikeId" = true
  }
}

# Integration for GET bikes
resource "aws_api_gateway_integration" "bikes_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bikes.id
  http_method = aws_api_gateway_method.bikes_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.bike_management_lambda_invoke_arn

  request_parameters = {
    "integration.request.querystring.bikeType"    = "method.request.querystring.bikeType"
    "integration.request.querystring.status"      = "method.request.querystring.status"
    "integration.request.querystring.franchiseId" = "method.request.querystring.franchiseId"
  }
}

# Integration for POST bikes
resource "aws_api_gateway_integration" "bikes_post_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bikes.id
  http_method = aws_api_gateway_method.bikes_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.bike_management_lambda_invoke_arn
}

# Integration for PUT bike
resource "aws_api_gateway_integration" "bike_put_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_by_id.id
  http_method = aws_api_gateway_method.bike_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.bike_management_lambda_invoke_arn

  request_parameters = {
    "integration.request.path.bikeId" = "method.request.path.bikeId"
  }
}

# Integration for DELETE bike
resource "aws_api_gateway_integration" "bike_delete_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_by_id.id
  http_method = aws_api_gateway_method.bike_delete.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.bike_management_lambda_invoke_arn

  request_parameters = {
    "integration.request.path.bikeId" = "method.request.path.bikeId"
  }
}

# ================================
# BIKE AVAILABILITY ENDPOINTS (PUBLIC)
# ================================

# API Gateway Resource for Public Bike Availability
resource "aws_api_gateway_resource" "bike_availability" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "bike-availability"
}

# GET method for public bike availability (No authentication required)
resource "aws_api_gateway_method" "bike_availability_get" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.bike_availability.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.querystring.bikeType" = false
    "method.request.querystring.location" = false
  }
}

# Integration for GET bike availability
resource "aws_api_gateway_integration" "bike_availability_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_availability.id
  http_method = aws_api_gateway_method.bike_availability_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.bike_availability_lambda_invoke_arn

  request_parameters = {
    "integration.request.querystring.bikeType" = "method.request.querystring.bikeType"
    "integration.request.querystring.location" = "method.request.querystring.location"
  }
}

# ================================
# DISCOUNT CODE ENDPOINTS
# ================================

# API Gateway Resource for Discount Codes
resource "aws_api_gateway_resource" "discount_codes" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "discount-codes"
}

# API Gateway Resource for specific discount code operations
resource "aws_api_gateway_resource" "discount_code_by_id" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_resource.discount_codes.id
  path_part   = "{codeId}"
}

# GET method for retrieving discount codes (Admin only)
resource "aws_api_gateway_method" "discount_codes_get" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.discount_codes.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id

  request_parameters = {
    "method.request.querystring.status" = false
  }
}

# POST method for creating discount codes (Admin only)
resource "aws_api_gateway_method" "discount_codes_post" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.discount_codes.id
  http_method   = "POST"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id
}

# PUT method for updating discount codes (Admin only)
resource "aws_api_gateway_method" "discount_code_put" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.discount_code_by_id.id
  http_method   = "PUT"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id

  request_parameters = {
    "method.request.path.codeId" = true
  }
}

# DELETE method for deactivating discount codes (Admin only)
resource "aws_api_gateway_method" "discount_code_delete" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.discount_code_by_id.id
  http_method   = "DELETE"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id

  request_parameters = {
    "method.request.path.codeId" = true
  }
}

# Integration for GET discount codes
resource "aws_api_gateway_integration" "discount_codes_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.discount_codes.id
  http_method = aws_api_gateway_method.discount_codes_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.discount_management_lambda_invoke_arn

  request_parameters = {
    "integration.request.querystring.status" = "method.request.querystring.status"
  }
}

# Integration for POST discount codes
resource "aws_api_gateway_integration" "discount_codes_post_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.discount_codes.id
  http_method = aws_api_gateway_method.discount_codes_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.discount_management_lambda_invoke_arn
}

# Integration for PUT discount code
resource "aws_api_gateway_integration" "discount_code_put_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.discount_code_by_id.id
  http_method = aws_api_gateway_method.discount_code_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.discount_management_lambda_invoke_arn

  request_parameters = {
    "integration.request.path.codeId" = "method.request.path.codeId"
  }
}

# Integration for DELETE discount code
resource "aws_api_gateway_integration" "discount_code_delete_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.discount_code_by_id.id
  http_method = aws_api_gateway_method.discount_code_delete.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.discount_management_lambda_invoke_arn

  request_parameters = {
    "integration.request.path.codeId" = "method.request.path.codeId"
  }
}

# ================================
# CORS SUPPORT
# ================================

# OPTIONS method for bikes
resource "aws_api_gateway_method" "bikes_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.bikes.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "bikes_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bikes.id
  http_method = aws_api_gateway_method.bikes_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# OPTIONS method for bike availability
resource "aws_api_gateway_method" "bike_availability_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.bike_availability.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "bike_availability_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_availability.id
  http_method = aws_api_gateway_method.bike_availability_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# OPTIONS method for discount codes
resource "aws_api_gateway_method" "discount_codes_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.discount_codes.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "discount_codes_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.discount_codes.id
  http_method = aws_api_gateway_method.discount_codes_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# OPTIONS method for individual bike operations
resource "aws_api_gateway_method" "bike_by_id_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.bike_by_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "bike_by_id_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_by_id.id
  http_method = aws_api_gateway_method.bike_by_id_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# ================================
# OPTIONS METHOD RESPONSES AND INTEGRATION RESPONSES
# ================================

# Method response for bikes OPTIONS
resource "aws_api_gateway_method_response" "bikes_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bikes.id
  http_method = aws_api_gateway_method.bikes_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "bikes_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bikes.id
  http_method = aws_api_gateway_method.bikes_options.http_method
  status_code = aws_api_gateway_method_response.bikes_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.bikes_options_integration]
}

# Method response for bike availability OPTIONS
resource "aws_api_gateway_method_response" "bike_availability_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_availability.id
  http_method = aws_api_gateway_method.bike_availability_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "bike_availability_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_availability.id
  http_method = aws_api_gateway_method.bike_availability_options.http_method
  status_code = aws_api_gateway_method_response.bike_availability_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.bike_availability_options_integration]
}

# Method response for discount codes OPTIONS
resource "aws_api_gateway_method_response" "discount_codes_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.discount_codes.id
  http_method = aws_api_gateway_method.discount_codes_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "discount_codes_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.discount_codes.id
  http_method = aws_api_gateway_method.discount_codes_options.http_method
  status_code = aws_api_gateway_method_response.discount_codes_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.discount_codes_options_integration]
}

# Method response for bike by ID OPTIONS
resource "aws_api_gateway_method_response" "bike_by_id_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_by_id.id
  http_method = aws_api_gateway_method.bike_by_id_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "bike_by_id_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_by_id.id
  http_method = aws_api_gateway_method.bike_by_id_options.http_method
  status_code = aws_api_gateway_method_response.bike_by_id_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.bike_by_id_options_integration]
}

# ================================
# METHOD RESPONSES AND INTEGRATION RESPONSES
# ================================

# Method responses for bikes GET
resource "aws_api_gateway_method_response" "bikes_get_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bikes.id
  http_method = aws_api_gateway_method.bikes_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "bikes_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bikes.id
  http_method = aws_api_gateway_method.bikes_get.http_method
  status_code = aws_api_gateway_method_response.bikes_get_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.bikes_get_integration]
}

# Method responses for bike availability GET
resource "aws_api_gateway_method_response" "bike_availability_get_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_availability.id
  http_method = aws_api_gateway_method.bike_availability_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "bike_availability_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_availability.id
  http_method = aws_api_gateway_method.bike_availability_get.http_method
  status_code = aws_api_gateway_method_response.bike_availability_get_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.bike_availability_integration]
}

# Method responses for bikes POST
resource "aws_api_gateway_method_response" "bikes_post_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bikes.id
  http_method = aws_api_gateway_method.bikes_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "bikes_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bikes.id
  http_method = aws_api_gateway_method.bikes_post.http_method
  status_code = aws_api_gateway_method_response.bikes_post_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.bikes_post_integration]
}

# Method responses for bike PUT
resource "aws_api_gateway_method_response" "bike_put_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_by_id.id
  http_method = aws_api_gateway_method.bike_put.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "bike_put_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_by_id.id
  http_method = aws_api_gateway_method.bike_put.http_method
  status_code = aws_api_gateway_method_response.bike_put_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.bike_put_integration]
}

# Method responses for bike DELETE
resource "aws_api_gateway_method_response" "bike_delete_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_by_id.id
  http_method = aws_api_gateway_method.bike_delete.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "bike_delete_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bike_by_id.id
  http_method = aws_api_gateway_method.bike_delete.http_method
  status_code = aws_api_gateway_method_response.bike_delete_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.bike_delete_integration]
}

# ================================
# LAMBDA PERMISSIONS
# ================================

# Lambda permission for bike management
resource "aws_lambda_permission" "api_gateway_invoke_bike_management" {
  statement_id  = "AllowAPIGatewayInvokeBikeManagement"
  action        = "lambda:InvokeFunction"
  function_name = var.bike_management_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}

# Lambda permission for bike availability
resource "aws_lambda_permission" "api_gateway_invoke_bike_availability" {
  statement_id  = "AllowAPIGatewayInvokeBikeAvailability"
  action        = "lambda:InvokeFunction"
  function_name = var.bike_availability_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}

# Lambda permission for discount management
resource "aws_lambda_permission" "api_gateway_invoke_discount_management" {
  statement_id  = "AllowAPIGatewayInvokeDiscountManagement"
  action        = "lambda:InvokeFunction"
  function_name = var.discount_management_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}
