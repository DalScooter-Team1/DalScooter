# ================================
# GET LOGGED IN USERS LAMBDA
# ================================
# This lambda function tracks logged-in users via heartbeat

# IAM Role for Get Logged In Users Lambda
resource "aws_iam_role" "get_logged_in_users_lambda_role" {
  name = "dalscooter-get-logged-in-users-lambda-role"

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

# IAM Policy for Get Logged In Users Lambda
resource "aws_iam_role_policy" "get_logged_in_users_lambda_policy" {
  name = "dalscooter-get-logged-in-users-lambda-policy"
  role = aws_iam_role.get_logged_in_users_lambda_role.id

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
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Resource = var.logged_in_user_directory_table_arn
      }
    ]
  })
}

# Create a zip file for the Get Logged In Users Lambda function
data "archive_file" "get_logged_in_users_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/Admin/get_logged_in_users.py"
  output_path = "${path.module}/../../packages/get_logged_in_users.zip"
  depends_on  = [local_file.create_packages_dir]
}

# Get Logged In Users Lambda Function
resource "aws_lambda_function" "get_logged_in_users" {
  filename         = data.archive_file.get_logged_in_users_zip.output_path
  function_name    = "dalscooter-get-logged-in-users"
  role            = aws_iam_role.get_logged_in_users_lambda_role.arn
  handler         = "get_logged_in_users.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  source_code_hash = data.archive_file.get_logged_in_users_zip.output_base64sha256

  environment {
    variables = {
      DYNAMODB_TABLE = var.logged_in_user_directory_table_name
    }
  }

  depends_on = [
    aws_iam_role_policy.get_logged_in_users_lambda_policy,
    aws_cloudwatch_log_group.get_logged_in_users_lambda_log_group,
  ]
}

# CloudWatch Log Group for Get Logged In Users Lambda
resource "aws_cloudwatch_log_group" "get_logged_in_users_lambda_log_group" {
  name              = "/aws/lambda/dalscooter-get-logged-in-users"
  retention_in_days = 14
}
