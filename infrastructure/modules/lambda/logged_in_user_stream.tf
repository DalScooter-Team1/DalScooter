# ================================
# LOGGED IN USER DIRECTORY STREAM PROCESSOR LAMBDA
# ================================


# variable "logged_in_user_directory_stream_arn" is defined in variables.tf

variable "s3_bucket_name" {
  description = "Name of the S3 bucket to store CSV logs"
  type        = string
}

variable "s3_folder" {
  description = "S3 folder for CSV logs (optional)"
  type        = string
  default     = "logged_in_user_directory/"
}

# IAM Role for the Lambda
resource "aws_iam_role" "logged_in_user_stream_lambda_role" {
  name = "dalscooter-logged-in-user-stream-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "logged_in_user_stream_lambda_policy" {
  name = "dalscooter-logged-in-user-stream-lambda-policy"
  role = aws_iam_role.logged_in_user_stream_lambda_role.id
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
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminListGroupsForUser"
        ]
        Resource = var.cognito_user_pool_arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams"
        ]
        Resource = var.logged_in_user_directory_stream_arn
      },
      {
        Effect = "Allow"
        Action = ["s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.s3_bucket_name}",
          "arn:aws:s3:::${var.s3_bucket_name}/*"
        ]
      }
    ]
  })
}

# Archive the Lambda function
data "archive_file" "logged_in_user_stream_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/Admin/logged_in_user_stream.py"
  output_path = "${path.module}/../../packages/logged_in_user_stream.zip"
  depends_on  = [local_file.create_packages_dir]
}

# Lambda Function
resource "aws_lambda_function" "logged_in_user_stream" {
  filename         = data.archive_file.logged_in_user_stream_zip.output_path
  function_name    = "dalscooter-logged-in-user-stream"
  role             = aws_iam_role.logged_in_user_stream_lambda_role.arn
  handler          = "logged_in_user_stream.lambda_handler"
  runtime          = "python3.9"
  timeout          = 60
  memory_size      = 512
  source_code_hash = data.archive_file.logged_in_user_stream_zip.output_base64sha256

  # Add MySQL layer if it exists
  layers = var.mysql_layer_arn != "" ? [var.mysql_layer_arn] : []

  environment {
    variables = {
      S3_BUCKET            = var.s3_bucket_name
      S3_FOLDER            = var.s3_folder
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
      # MySQL connection variables (optional)
      MYSQL_HOST           = var.mysql_host
      MYSQL_PORT           = var.mysql_port
      MYSQL_DATABASE       = var.mysql_database
      MYSQL_USERNAME       = var.mysql_username
      MYSQL_PASSWORD       = var.mysql_password
    }
  }
  depends_on = [aws_iam_role_policy.logged_in_user_stream_lambda_policy]
}

# Event Source Mapping
resource "aws_lambda_event_source_mapping" "logged_in_user_stream_mapping" {
  event_source_arn  = var.logged_in_user_directory_stream_arn
  function_name     = aws_lambda_function.logged_in_user_stream.arn
  starting_position = "LATEST"
  batch_size        = 10
}
