# ================================
# BOOKING DATA PIPELINE
# ================================
# This file contains the Lambda function that syncs DynamoDB booking data to MySQL

# Variables for MySQL connection (from environment)
variable "mysql_host" {
  description = "MySQL host endpoint"
  type        = string
}

variable "mysql_port" {
  description = "MySQL port"
  type        = string
  default     = "3306"
}

variable "mysql_database" {
  description = "MySQL database name"
  type        = string
}

variable "mysql_username" {
  description = "MySQL username"
  type        = string
}

variable "mysql_password" {
  description = "MySQL password"
  type        = string
  sensitive   = true
}

# IAM Role for Data Pipeline Lambda
resource "aws_iam_role" "booking_data_pipeline_lambda_role" {
  name = "dalscooter-booking-data-pipeline-lambda-role"

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

  tags = {
    Name    = "DALScooter Booking Data Pipeline Lambda Role"
    Project = "DALScooter"
  }
}

# IAM Policy for Data Pipeline Lambda
resource "aws_iam_role_policy" "booking_data_pipeline_lambda_policy" {
  name = "dalscooter-booking-data-pipeline-lambda-policy"
  role = aws_iam_role.booking_data_pipeline_lambda_role.id

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
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams"
        ]
        Resource = aws_dynamodb_table.booking_table.stream_arn
      }
    ]
  })
}

# Lambda Layer for MySQL dependencies (using static pre-built zip)
resource "aws_lambda_layer_version" "mysql_layer" {
  filename            = "${path.module}/../packages/mysql_layer_static.zip"
  layer_name          = "dalscooter-mysql-layer"
  compatible_runtimes = ["python3.9"]
  description         = "MySQL connector and dependencies (PyMySQL + cryptography)"
  source_code_hash    = filebase64sha256("${path.module}/../packages/mysql_layer_static.zip")
}

# Create zip file for the Lambda function
data "archive_file" "booking_data_pipeline_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/BookingQueue/booking_data_pipeline.py"
  output_path = "${path.module}/../packages/booking_data_pipeline.zip"
  depends_on  = [local_file.create_data_pipeline_packages_dir]
}

resource "local_file" "create_data_pipeline_packages_dir" {
  content  = "Data pipeline packages directory"
  filename = "${path.module}/../packages/booking_data_pipeline/.gitkeep"
}

# Lambda Function for Booking Data Pipeline
resource "aws_lambda_function" "booking_data_pipeline" {
  filename         = data.archive_file.booking_data_pipeline_zip.output_path
  function_name    = "dalscooter-booking-data-pipeline"
  role            = aws_iam_role.booking_data_pipeline_lambda_role.arn
  handler         = "booking_data_pipeline.lambda_handler"
  runtime         = "python3.9"
  timeout         = 300  # 5 minutes
  memory_size     = 512
  source_code_hash = data.archive_file.booking_data_pipeline_zip.output_base64sha256

  # Add MySQL layer
  layers = [aws_lambda_layer_version.mysql_layer.arn]

  # No VPC configuration - Lambda will run in AWS-managed VPC
  # Database connection details from environment variables

  environment {
    variables = {
      MYSQL_HOST     = var.mysql_host
      MYSQL_PORT     = var.mysql_port
      MYSQL_DATABASE = var.mysql_database
      MYSQL_USERNAME = var.mysql_username
      MYSQL_PASSWORD = var.mysql_password
    }
  }

  depends_on = [
    aws_iam_role_policy.booking_data_pipeline_lambda_policy,
    aws_cloudwatch_log_group.booking_data_pipeline_log_group
  ]

  tags = {
    Name    = "DALScooter Booking Data Pipeline"
    Project = "DALScooter"
  }
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "booking_data_pipeline_log_group" {
  name              = "/aws/lambda/dalscooter-booking-data-pipeline"
  retention_in_days = 14

  tags = {
    Name    = "DALScooter Booking Data Pipeline Logs"
    Project = "DALScooter"
  }
}

# Event Source Mapping - DynamoDB Stream to Lambda
resource "aws_lambda_event_source_mapping" "booking_stream_trigger" {
  event_source_arn  = aws_dynamodb_table.booking_table.stream_arn
  function_name     = aws_lambda_function.booking_data_pipeline.arn
  starting_position = "LATEST"
  batch_size        = 10
  enabled           = true

  depends_on = [
    aws_lambda_function.booking_data_pipeline,
    aws_dynamodb_table.booking_table
  ]
}

# Output values
output "booking_data_pipeline_function_name" {
  description = "Name of the booking data pipeline Lambda function"
  value       = aws_lambda_function.booking_data_pipeline.function_name
}

output "booking_data_pipeline_function_arn" {
  description = "ARN of the booking data pipeline Lambda function"
  value       = aws_lambda_function.booking_data_pipeline.arn
}
