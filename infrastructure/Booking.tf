

# IAM Role for Lambda
resource "aws_iam_role" "lambda_exec_role" {
  name = "dal_lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_sqs" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

# Additional IAM policy for bike table access
resource "aws_iam_role_policy" "bike_table_access" {
  name = "bike-table-access"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.bikes.arn,
          "${aws_dynamodb_table.bikes.arn}/index/*"
        ]
      }
    ]
  })
}

# SQS Queue
resource "aws_sqs_queue" "booking_queue" {
  name                       = "dal-booking-queue"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 345600
  receive_wait_time_seconds  = 5
  delay_seconds              = 0
}

data "archive_file" "booking_request" {
  type        = "zip"
  source_file = "${path.module}/../backend/BookingQueue/BookingRequest/booking_request.py"
  output_path = "${path.module}/packages/booking_req.zip"
}

data "archive_file" "booking_approval" {
  type        = "zip"
  source_file = "${path.module}/../backend/BookingQueue/BookingApproval/booking_approval.py"
  output_path = "${path.module}/packages/booking_approve.zip"
}
# BookingRequest Lambda 
resource "aws_lambda_function" "booking_request" {
  function_name    = "booking-request"
  handler          = "booking_request.handler"
  runtime          = "python3.9"
  filename         = data.archive_file.booking_request.output_path
  source_code_hash = data.archive_file.booking_request.output_base64sha256
  role             = aws_iam_role.lambda_exec_role.arn

  environment {
    variables = {
      SQS_QUEUE_URL      = aws_sqs_queue.booking_queue.id
      BOOKING_TABLE_NAME = aws_dynamodb_table.booking_table.name
    }
  }

  depends_on = [
    aws_iam_role.lambda_exec_role,
    aws_sqs_queue.booking_queue
  ]
}




# BookingApproval Lambda 
resource "aws_lambda_function" "booking_approval" {
  function_name    = "booking-approval"
  handler          = "booking_approval.handler"
  runtime          = "python3.9"
  filename         = data.archive_file.booking_approval.output_path
  source_code_hash = data.archive_file.booking_approval.output_base64sha256
  role             = aws_iam_role.lambda_exec_role.arn

  environment {
    variables = {
      BOOKING_TABLE_NAME = aws_dynamodb_table.booking_table.name
      BIKE_TABLE_NAME    = aws_dynamodb_table.bikes.name
    }
  }

  depends_on = [
    aws_iam_role.lambda_exec_role
  ]
}

# SQS → BookingApproval Lambda Trigger
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = aws_sqs_queue.booking_queue.arn
  function_name    = aws_lambda_function.booking_approval.arn
  batch_size       = 1
  enabled          = true
}

# ================================
# OUTPUT VALUES
# ================================

output "get_all_bookings_lambda_arn" {
  description = "ARN of the get all bookings Lambda function"
  value       = module.lambda.get_all_bookings_lambda_arn
}

output "get_all_bookings_lambda_invoke_arn" {
  description = "Invoke ARN of the get all bookings Lambda function"
  value       = module.lambda.get_all_bookings_lambda_invoke_arn
}

output "get_all_bookings_lambda_function_name" {
  description = "Function name of the get all bookings Lambda"
  value       = module.lambda.get_all_bookings_lambda_function_name
}
