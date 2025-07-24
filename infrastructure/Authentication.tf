####################################################################################################
# This resource file prepares the infrastructure for custom authentication challenges in AWS Cognito.
# It includes Lambda functions for defining, creating, and verifying authentication challenges.
####################################################################################################

# Factor 1: Username/Password Authentication
resource "aws_cognito_user_pool" "pool" {
  name = "DalScooterUserPool"

  # Configure required user attributes
  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true
  }

  schema {
    attribute_data_type = "String" 
    name                = "given_name"
    required            = true
    mutable             = true
  }

  schema {
    attribute_data_type = "String"
    name                = "family_name" 
    required            = true
    mutable             = true
  }

  # Email as username
  username_attributes = ["email"]
  
  # Remove the auto-verified attributes line or set it to an empty list
  auto_verified_attributes = []

  # Lambda triggers for custom authentication
  lambda_config {
    define_auth_challenge    = module.lambda.define_auth_challenge_lambda_arn
    create_auth_challenge    = module.lambda.create_auth_challenge_lambda_arn
    verify_auth_challenge_response = module.lambda.verify_auth_challenge_lambda_arn
  }
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
  
 
  lifecycle {
    ignore_changes = [schema]
  }
}

# App client for the user pool

resource "aws_cognito_user_pool_client" "client" {
  name = "DalScooterAppClient"

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",  # For Factor 1 (username/password)
    "ALLOW_CUSTOM_AUTH",         # For your 3-factor custom flow
    "ALLOW_REFRESH_TOKEN_AUTH"   # For refreshing tokens
  ]

 
  user_pool_id = aws_cognito_user_pool.pool.id

  depends_on = [ aws_cognito_user_pool.pool ]
}

# Customer User Group
resource "aws_cognito_user_group" "customers" {
  name         = "customers"
  user_pool_id = aws_cognito_user_pool.pool.id
  description  = "Regular customers who can reserve bikes"
  precedence   = 2  # Lower number = higher priority
}

# Franchise User Group  
resource "aws_cognito_user_group" "franchise" {
  name         = "franchise" 
  user_pool_id = aws_cognito_user_pool.pool.id
  description  = "Franchise operators with admin privileges"
  precedence   = 1  # Higher priority than customers
}

# Factor 2: Question and Answer Authentication

# DynamoDB table for user security questions
resource "aws_dynamodb_table" "user_security_questions" {
  name           = "dalscooter-user-security-questions"
  billing_mode   = "PAY_PER_REQUEST"  # On-demand pricing
  hash_key       = "userId"           # Partition key
  range_key      = "questionId"       # Sort key

  attribute {
    name = "userId"
    type = "S"  # String
  }

  attribute {
    name = "questionId" 
    type = "S"  # String
  }



  # Tags for resource management
  tags = {
    Name        = "DALScooter User Security Questions"
    Project     = "DALScooter"
  }
}

# DynamoDB table for tracking logged-in users
resource "aws_dynamodb_table" "logged_in_user_directory" {
  name           = "logged_in_user_directory"
  billing_mode   = "PAY_PER_REQUEST"  # On-demand pricing
  hash_key       = "sub"            # Partition key


  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "sub"
    type = "S"  # String
  }

  # Enable TTL on the expires_at attribute
  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  # Tags for resource management
  tags = {
    Name        = "DALScooter Logged In User Directory"
    Project     = "DALScooter"
  }
}

# Output the stream ARN for use in Lambda event source mapping
output "logged_in_user_directory_stream_arn" {
  value = aws_dynamodb_table.logged_in_user_directory.stream_arn
}

 

# Lambda Permissions for Cognito
resource "aws_lambda_permission" "cognito_define_auth" {
  statement_id  = "AllowCognitoDefineAuth"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda.define_auth_challenge_lambda_function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.pool.arn
}

resource "aws_lambda_permission" "cognito_create_auth" {
  statement_id  = "AllowCognitoCreateAuth"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda.create_auth_challenge_lambda_function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.pool.arn
}

resource "aws_lambda_permission" "cognito_verify_auth" {
  statement_id  = "AllowCognitoVerifyAuth"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda.verify_auth_challenge_lambda_function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.pool.arn
}

 
