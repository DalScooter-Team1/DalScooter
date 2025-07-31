# ================================
# LAMBDA FUNCTION TO POST FEEDBACK
# ================================
# This lambda function takes feedback from the customers and stores it in DynamoDB

# Variables for SQS queue integration
variable "feedback_queue_url" {
  description = "URL of the feedback processing SQS queue"
  type        = string
}

variable "feedback_queue_arn" {
  description = "ARN of the feedback processing SQS queue"
  type        = string
}

# IAM Role for Post Feedback Lambda
resource "aws_iam_role" "post_feedback_lambda_role" {
  name = "dalscooter-post-feedback-lambda-role"

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

#Assign IAM role with the permissions
resource "aws_iam_role_policy" "post_feedback_lambda_policy" {
  name = "dalscooter-post-feedback-lambda-policy"
  role = aws_iam_role.post_feedback_lambda_role.id

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
        Resource = aws_dynamodb_table.feedback_table.arn
      }
    ]
  })
}

#Create the DynamoDB table for storing feedback
resource "aws_dynamodb_table" "feedback_table" {
  name         = "dalscooter-feedback"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "email"
  range_key    = "timestamp"

  attribute {
    name = "email"
    type = "S"
  }
  attribute {
    name = "timestamp"
    type = "S"
  }

  # Enable DynamoDB Streams
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  tags = {
    Name = "DalScooter Feedback Table"
  }
}

# Create a zip file for the Post Feedback Lambda function
data "archive_file" "post_feedback_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/Feedback/post_feedback.py"
  output_path = "${path.module}/../../packages/post_feedback.zip"
}

# Post Feedback Lambda Function
resource "aws_lambda_function" "post_feedback_lambda" {
  function_name    = "dalscooter-post-feedback-lambda"
  role             = aws_iam_role.post_feedback_lambda_role.arn
  handler          = "post_feedback.lambda_handler"
  runtime          = "python3.9"
  filename         = data.archive_file.post_feedback_zip.output_path
  source_code_hash = data.archive_file.post_feedback_zip.output_base64sha256
  timeout          = 30
  environment {
    variables = {
      FEEDBACK_TABLE = aws_dynamodb_table.feedback_table.name
    }
  }
  tags = {
    Name = "DalScooter Post Feedback Lambda"
  }
  depends_on = [aws_iam_role_policy.post_feedback_lambda_policy]
}

# ================================
# GET FEEDBACK LAMBDA
# ================================

# Create a zip file for the Get Feedback Lambda function
data "archive_file" "get_feedback_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/Feedback/get_feedback.py"
  output_path = "${path.module}/../../packages/get_feedback.zip"
}

# Get Feedback Lambda Function
resource "aws_lambda_function" "get_feedback_lambda" {
  function_name    = "dalscooter-get-feedback-lambda"
  role             = aws_iam_role.post_feedback_lambda_role.arn
  handler          = "get_feedback.lambda_handler"
  runtime          = "python3.9"
  filename         = data.archive_file.get_feedback_zip.output_path
  source_code_hash = data.archive_file.get_feedback_zip.output_base64sha256
  timeout          = 30
  environment {
    variables = {
      FEEDBACK_TABLE = aws_dynamodb_table.feedback_table.name
    }
  }
  tags = {
    Name = "DalScooter Get Feedback Lambda"
  }
  depends_on = [aws_iam_role_policy.post_feedback_lambda_policy]
}

# ================================
# DYNAMODB STREAM PROCESSOR
# ================================
# This lambda function processes DynamoDB stream events and sends UUID to SQS

# IAM Role for Stream Processor Lambda
resource "aws_iam_role" "stream_processor_lambda_role" {
  name = "dalscooter-stream-processor-lambda-role"

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

# IAM Policy for Stream Processor Lambda
resource "aws_iam_role_policy" "stream_processor_lambda_policy" {
  name = "dalscooter-stream-processor-lambda-policy"
  role = aws_iam_role.stream_processor_lambda_role.id

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
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.feedback_table.arn
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage"
        ]
        Resource = var.feedback_queue_arn
      }
    ]
  })
}

# Create a zip file for the Stream Processor Lambda function
data "archive_file" "stream_processor_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/Feedback/feedback_stream_processor.py"
  output_path = "${path.module}/../../packages/feedback_stream_processor.zip"
}

# Stream Processor Lambda Function
resource "aws_lambda_function" "stream_processor_lambda" {
  function_name    = "dalscooter-feedback-stream-processor"
  role             = aws_iam_role.stream_processor_lambda_role.arn
  handler          = "feedback_stream_processor.lambda_handler"
  runtime          = "python3.9"
  filename         = data.archive_file.stream_processor_zip.output_path
  source_code_hash = data.archive_file.stream_processor_zip.output_base64sha256
  timeout          = 30

  environment {
    variables = {
      FEEDBACK_TABLE = aws_dynamodb_table.feedback_table.name
      FEEDBACK_QUEUE_URL = var.feedback_queue_url
    }
  }

  tags = {
    Name = "DalScooter Feedback Stream Processor Lambda"
  }

  depends_on = [aws_iam_role_policy.stream_processor_lambda_policy]
}

# DynamoDB Stream Event Source Mapping for Stream Processor Lambda
resource "aws_lambda_event_source_mapping" "feedback_stream_mapping" {
  event_source_arn  = aws_dynamodb_table.feedback_table.stream_arn
  function_name     = aws_lambda_function.stream_processor_lambda.arn
  starting_position = "LATEST"
  batch_size        = 1
  enabled           = true
}

# ================================
# ANALYSE FEEDBACK LAMBDA
# ================================
# This lambda function analyses feedback sentiment using AWS Comprehend

# IAM Role for Analyse Feedback Lambda
resource "aws_iam_role" "analyse_feedback_lambda_role" {
  name = "dalscooter-analyse-feedback-lambda-role"

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

# IAM Policy for Analyse Feedback Lambda
resource "aws_iam_role_policy" "analyse_feedback_lambda_policy" {
  name = "dalscooter-analyse-feedback-lambda-policy"
  role = aws_iam_role.analyse_feedback_lambda_role.id

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
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.feedback_table.arn
      },
      {
        Effect = "Allow"
        Action = [
          "comprehend:DetectSentiment"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = var.feedback_queue_arn
      }
    ]
  })
}

# Create a zip file for the Analyse Feedback Lambda function
data "archive_file" "analyse_feedback_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/Feedback/analyse_feedback.py"
  output_path = "${path.module}/../../packages/analyse_feedback.zip"
}

# Analyse Feedback Lambda Function
resource "aws_lambda_function" "analyse_feedback_lambda" {
  function_name    = "dalscooter-analyse-feedback"
  role             = aws_iam_role.analyse_feedback_lambda_role.arn
  handler          = "analyse_feedback.lambda_handler"
  runtime          = "python3.9"
  filename         = data.archive_file.analyse_feedback_zip.output_path
  source_code_hash = data.archive_file.analyse_feedback_zip.output_base64sha256
  timeout          = 60

  environment {
    variables = {
      FEEDBACK_TABLE = aws_dynamodb_table.feedback_table.name
    }
  }

  tags = {
    Name = "DalScooter Analyse Feedback Lambda"
  }

  depends_on = [aws_iam_role_policy.analyse_feedback_lambda_policy]
}

# SQS Event Source Mapping for Analyse Feedback Lambda
resource "aws_lambda_event_source_mapping" "analyse_feedback_sqs_mapping" {
  event_source_arn = var.feedback_queue_arn
  function_name    = aws_lambda_function.analyse_feedback_lambda.arn
  batch_size       = 5
  enabled          = true

  # Optional: Filter to only process feedback analysis messages
  filter_criteria {
    filter {
      pattern = jsonencode({
        messageAttributes = {
          action = {
            stringValue = ["process_feedback"]
          }
        }
      })
    }
  }
}

# Outputs (only new ones not already defined in outputs.tf)
output "feedback_table_name" {
  value = aws_dynamodb_table.feedback_table.name
}

output "feedback_table_arn" {
  value = aws_dynamodb_table.feedback_table.arn
}

output "feedback_table_stream_arn" {
  value = aws_dynamodb_table.feedback_table.stream_arn
}

output "stream_processor_lambda_arn" {
  value = aws_lambda_function.stream_processor_lambda.arn
}

output "stream_processor_lambda_function_name" {
  value = aws_lambda_function.stream_processor_lambda.function_name
}

output "analyse_feedback_lambda_arn" {
  value = aws_lambda_function.analyse_feedback_lambda.arn
}

output "analyse_feedback_lambda_function_name" {
  value = aws_lambda_function.analyse_feedback_lambda.function_name
}

output "analyse_feedback_sqs_event_source_mapping_uuid" {
  value = aws_lambda_event_source_mapping.analyse_feedback_sqs_mapping.uuid
}

# Get Feedback Lambda outputs
output "get_feedback_lambda_arn" {
  value = aws_lambda_function.get_feedback_lambda.arn
}

output "get_feedback_lambda_invoke_arn" {
  value = aws_lambda_function.get_feedback_lambda.invoke_arn
}

output "get_feedback_lambda_function_name" {
  value = aws_lambda_function.get_feedback_lambda.function_name
}
