resource "aws_iam_role" "booking_request_lambda_role" {
  name = "booking-request-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "booking_request_lambda_policy" {
  name = "booking-request-lambda-policy"
  role = aws_iam_role.booking_request_lambda_role.id
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
          "dynamodb:PutItem"
        ]
        Resource = var.booking_table_arn
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage"
        ]
        Resource = var.sqs_queue_arn
      }
    ]
  })
}

data "archive_file" "booking_request_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/BookingQueue/BookingRequest/booking_request.py"
  output_path = "${path.module}/../../packages/booking_request.zip"
  depends_on  = [local_file.create_booking_packages_dir]
}

# Ensure the packages directory exists
resource "local_file" "create_booking_packages_dir" {
  content  = "Booking request packages directory"
  filename = "${path.module}/../../packages/.gitkeep"
}

resource "aws_lambda_function" "booking_request" {
  function_name = "booking-request"
  filename      = data.archive_file.booking_request_zip.output_path
  handler       = "booking_request.handler"
  runtime       = "python3.11"
  role          = aws_iam_role.booking_request_lambda_role.arn

  environment {
    variables = {
      BOOKING_TABLE_NAME = var.booking_table_name
      SQS_QUEUE_URL      = var.sqs_queue_url
    }
  }

  source_code_hash = data.archive_file.booking_request_zip.output_base64sha256
  timeout          = 15
  memory_size      = 256
}

 

variable "booking_table_name" {
  description = "DynamoDB table name for bookings"
  type        = string
}

variable "booking_table_arn" {
  description = "DynamoDB table ARN for bookings"
  type        = string
}

variable "sqs_queue_url" {
  description = "SQS queue URL for booking approval"
  type        = string
}

variable "sqs_queue_arn" {
  description = "SQS queue ARN for booking approval"
  type        = string
}
