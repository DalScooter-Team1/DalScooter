# ================================
# GET ACTIVE USERS LAMBDA
# ================================
# This lambda retrieves currently active (non-expired) users from DynamoDB
# Should be accessed by admin only

# IAM Role for Get Active Users Lambda
resource "aws_iam_role" "get_active_users_lambda_role" {
  name = "dalscooter-get-active-users-lambda-role"

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

# IAM Policy for Get Active Users Lambda
resource "aws_iam_role_policy" "get_active_users_lambda_policy" {
  name = "dalscooter-get-active-users-lambda-policy"
  role = aws_iam_role.get_active_users_lambda_role.id

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
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:GetItem"
        ]
        Resource = var.logged_in_user_directory_table_arn
      },
      {
        Effect   = "Allow"
        Action   = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminListGroupsForUser"
        ]
        Resource = var.cognito_user_pool_arn
      }
    ]
  })
}

# Create a zip file for the Get Active Users Lambda function
data "archive_file" "get_active_users_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/Admin/get_active_users.py"
  output_path = "${path.module}/../../packages/get_active_users.zip"
  depends_on  = [local_file.create_packages_dir]
}

# Get Active Users Lambda Function
resource "aws_lambda_function" "get_active_users" {
  filename         = data.archive_file.get_active_users_zip.output_path
  function_name    = "dalscooter-get-active-users"
  role            = aws_iam_role.get_active_users_lambda_role.arn
  handler         = "get_active_users.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  source_code_hash = data.archive_file.get_active_users_zip.output_base64sha256

  environment {
    variables = {
      DYNAMODB_TABLE = var.logged_in_user_directory_table_name
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
    }
  }

  depends_on = [
    aws_iam_role_policy.get_active_users_lambda_policy,
    aws_cloudwatch_log_group.get_active_users_lambda_log_group,
  ]
}

# CloudWatch Log Group for Get Active Users Lambda
resource "aws_cloudwatch_log_group" "get_active_users_lambda_log_group" {
  name              = "/aws/lambda/dalscooter-get-active-users"
  retention_in_days = 14
}
