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
    define_auth_challenge    = aws_lambda_function.define_auth_challenge.arn
    create_auth_challenge    = aws_lambda_function.create_auth_challenge.arn
    verify_auth_challenge_response = aws_lambda_function.verify_auth_challenge.arn
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


# Registration

resource "aws_iam_role" "registration_lambda_role" {
  name = "dalscooter-registration-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "registration_lambda_policy" {
  name = "dalscooter-registration-lambda-policy"
  role = aws_iam_role.registration_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream", 
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:SignUp",
          "cognito-idp:AdminConfirmSignUp"  # Added permission
        ]
        Resource = aws_cognito_user_pool.pool.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem"
        ]
        Resource = aws_dynamodb_table.user_security_questions.arn
      }
    ]
  })
}

# Create a directory for the package if it doesn't exist
resource "local_file" "create_packages_dir" {
  content     = ""
  filename    = "${path.module}/packages/.keep"
  
  provisioner "local-exec" {
    command = "mkdir -p ${path.module}/packages"
  }
}

# Create a zip file for the Lambda function from the Registration.py file
data "archive_file" "user_registration_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/User Management/Registration.py"
  output_path = "${path.module}/packages/user_registration.zip"
  depends_on  = [local_file.create_packages_dir]
}

resource "aws_lambda_function" "user_registration" {
  filename         = data.archive_file.user_registration_zip.output_path
  function_name    = "dalscooter-user-registration"
  role            = aws_iam_role.registration_lambda_role.arn
  handler         = "Registration.lambda_handler"  # Corrected handler name
  runtime         = "python3.9"
  timeout         = 30
  
  # This ensures the function is updated when the zip file changes
  source_code_hash = data.archive_file.user_registration_zip.output_base64sha256

  environment {
    variables = {
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.pool.id
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.client.id
      SECURITY_QUESTIONS_TABLE = aws_dynamodb_table.user_security_questions.name
    }
  }
}





# Custom Lambda extensions for the custom 3-factor authentication flow
# IAM Role for Auth Lambda Functions
resource "aws_iam_role" "auth_lambda_role" {
  name = "dalscooter-auth-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Auth Lambda Functions
resource "aws_iam_role_policy" "auth_lambda_policy" {
  name = "dalscooter-auth-lambda-policy"
  role = aws_iam_role.auth_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream", 
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query"
        ]
        Resource = aws_dynamodb_table.user_security_questions.arn
      }
    ]
  })
}

# 1. Define Auth Challenge Lambda
data "archive_file" "define_auth_challenge_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/User Management/define_auth_challenge.py"
  output_path = "${path.module}/packages/define_auth_challenge.zip"
  depends_on  = [local_file.create_packages_dir]
}

resource "aws_lambda_function" "define_auth_challenge" {
  filename         = data.archive_file.define_auth_challenge_zip.output_path
  function_name    = "dalscooter-define-auth-challenge"
  role            = aws_iam_role.auth_lambda_role.arn
  handler         = "define_auth_challenge.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  
  source_code_hash = data.archive_file.define_auth_challenge_zip.output_base64sha256
}

# 2. Create Auth Challenge Lambda
data "archive_file" "create_auth_challenge_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/User Management/create_auth_challenge.py"
  output_path = "${path.module}/packages/create_auth_challenge.zip"
  depends_on  = [local_file.create_packages_dir]
}

resource "aws_lambda_function" "create_auth_challenge" {
  filename         = data.archive_file.create_auth_challenge_zip.output_path
  function_name    = "dalscooter-create-auth-challenge"
  role            = aws_iam_role.auth_lambda_role.arn
  handler         = "create_auth_challenge.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  
  source_code_hash = data.archive_file.create_auth_challenge_zip.output_base64sha256

  environment {
    variables = {
      SECURITY_QUESTIONS_TABLE = aws_dynamodb_table.user_security_questions.name
    }
  }
}

# 3. Verify Auth Challenge Lambda
data "archive_file" "verify_auth_challenge_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/User Management/verify_auth_challenge.py"
  output_path = "${path.module}/packages/verify_auth_challenge.zip"
  depends_on  = [local_file.create_packages_dir]
}

resource "aws_lambda_function" "verify_auth_challenge" {
  filename         = data.archive_file.verify_auth_challenge_zip.output_path
  function_name    = "dalscooter-verify-auth-challenge"
  role            = aws_iam_role.auth_lambda_role.arn
  handler         = "verify_auth_challenge.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  
  source_code_hash = data.archive_file.verify_auth_challenge_zip.output_base64sha256
}

# Lambda Permissions for Cognito
resource "aws_lambda_permission" "cognito_define_auth" {
  statement_id  = "AllowCognitoDefineAuth"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.define_auth_challenge.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.pool.arn
}

resource "aws_lambda_permission" "cognito_create_auth" {
  statement_id  = "AllowCognitoCreateAuth"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_auth_challenge.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.pool.arn
}

resource "aws_lambda_permission" "cognito_verify_auth" {
  statement_id  = "AllowCognitoVerifyAuth"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.verify_auth_challenge.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.pool.arn
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.pool.id  
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.client.id
}

# Admin Creation Lambda Function
# IAM Role for Admin Creation Lambda
resource "aws_iam_role" "admin_creation_lambda_role" {
  name = "dalscooter-admin-creation-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Admin Creation Lambda
resource "aws_iam_role_policy" "admin_creation_lambda_policy" {
  name = "dalscooter-admin-creation-lambda-policy"
  role = aws_iam_role.admin_creation_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream", 
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:AdminRemoveUserFromGroup"
        ]
        Resource = aws_cognito_user_pool.pool.arn
      }
    ]
  })
}

# Create a zip file for the Admin Creation Lambda function
data "archive_file" "admin_creation_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/User Management/admin_creation.py"
  output_path = "${path.module}/packages/admin_creation.zip"
  depends_on  = [local_file.create_packages_dir]
}

# Admin Creation Lambda Function
resource "aws_lambda_function" "admin_creation" {
  filename         = data.archive_file.admin_creation_zip.output_path
  function_name    = "dalscooter-admin-creation"
  role             = aws_iam_role.admin_creation_lambda_role.arn
  handler          = "admin_creation.lambda_handler"
  runtime          = "python3.9"
  timeout          = 30
  
  # This ensures the function is updated when the zip file changes
  source_code_hash = data.archive_file.admin_creation_zip.output_base64sha256

  environment {
    variables = {
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.pool.id
      COGNITO_GROUP_NAME   = aws_cognito_user_group.franchise.name
    }
  }
}

