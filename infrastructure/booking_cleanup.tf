# IAM Role for Lambda 
resource "aws_iam_role" "booking_cleanup_lambda_role" {
  name = "booking-cleanup-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

# IAM Policy for DynamoDB access
resource "aws_iam_role_policy" "booking_cleanup_policy" {
  name = "booking-cleanup-dynamodb-policy"
  role = aws_iam_role.booking_cleanup_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:Scan",
          "dynamodb:UpdateItem",
          "dynamodb:GetItem"
        ],
         
        Resource = aws_dynamodb_table.booking_table.arn
      },
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_dynamodb_table" "booking_table" {
  name         = var.booking_table_name
  billing_mode = "PAY_PER_REQUEST"
  
  # Enable DynamoDB streams for data pipeline
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
  
  attribute {
    name = "bookingId"
    type = "S"
  }

  hash_key = "bookingId"
  
  tags = {
    Name    = "DALScooter Booking Table"
    Project = "DALScooter"
  }
}

data "archive_file" "booking_cleanup_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/BookingQueue/booking_cleanup.py"
  output_path = "${path.module}/../packages/booking_cleanup.zip"
  depends_on  = [local_file.booking_cleanup_packages_dir]
}

resource "local_file" "booking_cleanup_packages_dir" {
  content  = "Booking cleanup packages directory"
  filename = "${path.module}/../packages/booking_cleanup/.gitkeep"
}
# Lambda Function (cleanup)
resource "aws_lambda_function" "booking_cleanup" {
 
  function_name = "booking-cleanup-handler"
  filename         = data.archive_file.booking_cleanup_zip.output_path
 
  handler          = "booking_cleanup.lambda_handler"
  runtime          = "python3.9"
  role             = aws_iam_role.booking_cleanup_lambda_role.arn
  source_code_hash = data.archive_file.booking_cleanup_zip.output_base64sha256

  environment {
    variables = {
      BOOKING_TABLE_NAME = var.booking_table_name
    }
  }
}

# EventBridge Rule - triggers every 5 minutes
resource "aws_cloudwatch_event_rule" "booking_cleanup_schedule" {
  name                = "booking-cleanup-schedule"
  schedule_expression = "rate(5 minutes)"
}

# Permission for EventBridge to invoke Lambda
resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.booking_cleanup.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.booking_cleanup_schedule.arn
}

# Attach Lambda to EventBridge Rule
resource "aws_cloudwatch_event_target" "booking_cleanup_target" {
  rule      = aws_cloudwatch_event_rule.booking_cleanup_schedule.name
  target_id = "booking-cleanup-lambda"
  arn       = aws_lambda_function.booking_cleanup.arn
}

# Output the stream ARN for use in data pipeline
output "booking_table_stream_arn" {
  description = "ARN of the booking table DynamoDB stream"
  value       = aws_dynamodb_table.booking_table.stream_arn
}
