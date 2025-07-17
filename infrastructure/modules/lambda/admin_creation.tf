# ================================
# ADMIN CREATION LAMBDA
# ================================

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
        Effect   = "Allow"
        Action   = [
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminSetUserPassword",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:AdminRemoveUserFromGroup",
          "cognito-idp:AdminGetUser"
        ]
        Resource = var.cognito_user_pool_arn
      },
       {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = var.signup_login_topic_arn
      },
      {
        Effect   = "Allow"
        Action   = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = var.security_questions_table_arn
      }
    ]
  })
}

# Create a zip file for the Admin Creation Lambda function
data "archive_file" "admin_creation_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/User Management/admin_creation.py"
  output_path = "${path.module}/../../packages/admin_creation.zip"
  depends_on  = [local_file.create_packages_dir]
}

# Admin Creation Lambda Function
resource "aws_lambda_function" "admin_creation" {
  filename         = data.archive_file.admin_creation_zip.output_path
  function_name    = "dalscooter-admin-creation"
  role            = aws_iam_role.admin_creation_lambda_role.arn
  handler         = "admin_creation.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  source_code_hash = data.archive_file.admin_creation_zip.output_base64sha256

  environment {
    variables = {
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
      COGNITO_CLIENT_ID    = var.cognito_client_id
      COGNITO_GROUP_NAME   = "franchise"
      SECURITY_QUESTIONS_TABLE = var.security_questions_table_name
      SIGNUP_LOGIN_TOPIC_ARN = var.signup_login_topic_arn
    }
  }
}
