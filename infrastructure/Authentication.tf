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
  
  # Auto-verify email
  auto_verified_attributes = ["email"]

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
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
