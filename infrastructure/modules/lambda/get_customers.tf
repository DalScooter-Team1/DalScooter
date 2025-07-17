# ================================
# GET CUSTOMERS LAMBDA
# ================================
# This lambda should be accessed by the admin only
# IAM Role for Get Customers Lambda
resource "aws_iam_role" "get_customers_lambda_role" {
  name = "dalscooter-get-customers-lambda-role"

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

# IAM Policy for Get Customers Lambda
resource "aws_iam_role_policy" "get_customers_lambda_policy" {
  name = "dalscooter-get-customers-lambda-policy"
  role = aws_iam_role.get_customers_lambda_role.id

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
          "cognito-idp:ListUsers",
          "cognito-idp:AdminListGroupsForUser",
          "cognito-idp:AdminGetUser"
        ]
        Resource = var.cognito_user_pool_arn
      }
    ]
  })
}

# Create a zip file for the Get Customers Lambda function
data "archive_file" "get_customers_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/Admin/get_customers.py"
  output_path = "${path.module}/../../packages/get_customers.zip"
  depends_on  = [local_file.create_packages_dir]
}

# Get Customers Lambda Function
resource "aws_lambda_function" "get_customers" {
  filename         = data.archive_file.get_customers_zip.output_path
  function_name    = "dalscooter-get-customers"
  role            = aws_iam_role.get_customers_lambda_role.arn
  handler         = "get_customers.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  source_code_hash = data.archive_file.get_customers_zip.output_base64sha256

  environment {
    variables = {
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
      COGNITO_CLIENT_ID    = var.cognito_client_id
    }
  }

  depends_on = [
    aws_iam_role_policy.get_customers_lambda_policy,
    aws_cloudwatch_log_group.get_customers_lambda_log_group,
  ]
}

# CloudWatch Log Group for Get Customers Lambda
resource "aws_cloudwatch_log_group" "get_customers_lambda_log_group" {
  name              = "/aws/lambda/dalscooter-get-customers"
  retention_in_days = 14
}
