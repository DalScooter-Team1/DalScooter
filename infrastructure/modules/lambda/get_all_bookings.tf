# ================================
# GET ALL BOOKINGS LAMBDA (ADMIN)
# ================================
# This lambda function fetches all bookings for admin dashboard

# IAM Role for Get All Bookings Lambda
resource "aws_iam_role" "get_all_bookings_lambda_role" {
  name = "dalscooter-get-all-bookings-lambda-role"

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

# IAM Policy for Get All Bookings Lambda
resource "aws_iam_role_policy" "get_all_bookings_lambda_policy" {
  name = "dalscooter-get-all-bookings-lambda-policy"
  role = aws_iam_role.get_all_bookings_lambda_role.id

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
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:GetItem"
        ]
        Resource = var.booking_table_arn
      }
    ]
  })
}

# Create a zip file for the Get All Bookings Lambda function
data "archive_file" "get_all_bookings_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/Admin/get_all_bookings.py"
  output_path = "${path.module}/../../packages/get_all_bookings.zip"
  depends_on  = [local_file.create_packages_dir]
}

# Get All Bookings Lambda Function
resource "aws_lambda_function" "get_all_bookings" {
  filename         = data.archive_file.get_all_bookings_zip.output_path
  function_name    = "dalscooter-get-all-bookings"
  role             = aws_iam_role.get_all_bookings_lambda_role.arn
  handler          = "get_all_bookings.handler"
  runtime          = "python3.9"
  timeout          = 30
  source_code_hash = data.archive_file.get_all_bookings_zip.output_base64sha256

  environment {
    variables = {
      BOOKING_TABLE_NAME = var.booking_table_name
    }
  }

  depends_on = [
    aws_iam_role_policy.get_all_bookings_lambda_policy,
    aws_cloudwatch_log_group.get_all_bookings_lambda_log_group,
  ]
}

# CloudWatch Log Group for Get All Bookings Lambda
resource "aws_cloudwatch_log_group" "get_all_bookings_lambda_log_group" {
  name              = "/aws/lambda/dalscooter-get-all-bookings"
  retention_in_days = 14
}
