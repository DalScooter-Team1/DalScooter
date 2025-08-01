# ================================
# GET MY BOOKINGS LAMBDA
# ================================
# This lambda function fetches bookings for a specific user based on userId

# IAM Role for Get My Bookings Lambda
resource "aws_iam_role" "get_my_bookings_lambda_role" {
  name = "dalscooter-get-my-bookings-lambda-role"

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

# IAM Policy for Get My Bookings Lambda
resource "aws_iam_role_policy" "get_my_bookings_lambda_policy" {
  name = "dalscooter-get-my-bookings-lambda-policy"
  role = aws_iam_role.get_my_bookings_lambda_role.id

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

# Create a zip file for the Get My Bookings Lambda function
data "archive_file" "get_my_bookings_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/BookingQueue/get_my_bookings.py"
  output_path = "${path.module}/../../packages/get_my_bookings.zip"
  depends_on  = [local_file.create_packages_dir]
}

# Get My Bookings Lambda Function
resource "aws_lambda_function" "get_my_bookings" {
  filename         = data.archive_file.get_my_bookings_zip.output_path
  function_name    = "dalscooter-get-my-bookings"
  role            = aws_iam_role.get_my_bookings_lambda_role.arn
  handler         = "get_my_bookings.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  source_code_hash = data.archive_file.get_my_bookings_zip.output_base64sha256

  environment {
    variables = {
      BOOKING_TABLE_NAME = var.booking_table_name
    }
  }

  depends_on = [
    aws_iam_role_policy.get_my_bookings_lambda_policy,
    aws_cloudwatch_log_group.get_my_bookings_lambda_log_group,
  ]
}

# CloudWatch Log Group for Get My Bookings Lambda
resource "aws_cloudwatch_log_group" "get_my_bookings_lambda_log_group" {
  name              = "/aws/lambda/dalscooter-get-my-bookings"
  retention_in_days = 14
}
