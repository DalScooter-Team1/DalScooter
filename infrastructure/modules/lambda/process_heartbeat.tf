# ================================
# GET LOGGED IN USERS LAMBDA
# ================================
# This lambda function tracks logged-in users via heartbeat

# IAM Role for Process Heartbeat Lambda
resource "aws_iam_role" "process_heartbeat_lambda_role" {
  name = "dalscooter-process-heartbeat-lambda-role"

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
resource "aws_iam_role_policy" "process_heartbeat_lambda_policy" {
  name = "dalscooter-process-heartbeat-lambda-policy"
  role = aws_iam_role.process_heartbeat_lambda_role.id

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

# Create a zip file for the Process Heartbeat Lambda function
data "archive_file" "process_heartbeat_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/Admin/process_heartbeat.py"
  output_path = "${path.module}/../../packages/process_heartbeat.zip"
  depends_on  = [local_file.create_packages_dir]
}

# Process Heartbeat Lambda Function
resource "aws_lambda_function" "process_heartbeat" {
  filename         = data.archive_file.process_heartbeat_zip.output_path
  function_name    = "dalscooter-process-heartbeat"
  role            = aws_iam_role.process_heartbeat_lambda_role.arn
  handler         = "process_heartbeat.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  source_code_hash = data.archive_file.process_heartbeat_zip.output_base64sha256

  environment {
    variables = {
      DYNAMODB_TABLE = var.logged_in_user_directory_table_name
    }
  }

  depends_on = [
    aws_iam_role_policy.process_heartbeat_lambda_policy,
    aws_cloudwatch_log_group.process_heartbeat_lambda_log_group,
  ]
}

# CloudWatch Log Group for Process Heartbeat Lambda
resource "aws_cloudwatch_log_group" "process_heartbeat_lambda_log_group" {
  name              = "/aws/lambda/dalscooter-process-heartbeat"
  retention_in_days = 14
}
