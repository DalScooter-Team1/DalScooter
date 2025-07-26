# ================================
# BIKE INVENTORY LAMBDA FUNCTIONS
# ================================
# This module contains all Lambda functions for bike inventory management

# ================================
# IAM ROLE AND POLICY
# ================================

# IAM Role for Bike Inventory Lambda Functions
resource "aws_iam_role" "bike_inventory_lambda_role" {
  name = "dalscooter-bike-inventory-lambda-role"

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

# IAM Policy for Bike Inventory Lambda Functions
resource "aws_iam_role_policy" "bike_inventory_lambda_policy" {
  name = "dalscooter-bike-inventory-lambda-policy"
  role = aws_iam_role.bike_inventory_lambda_role.id

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
        Resource = [
          var.bikes_table_arn,
          "${var.bikes_table_arn}/index/*",
          var.discount_codes_table_arn,
          "${var.discount_codes_table_arn}/index/*",
          var.user_discount_usage_table_arn,
          "${var.user_discount_usage_table_arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:ListUsers",
          "cognito-idp:AdminListGroupsForUser"
        ]
        Resource = var.cognito_user_pool_arn
      }
    ]
  })
}

# ================================
# BIKE MANAGEMENT LAMBDA
# ================================

# Create a zip file for the Bike Management Lambda function
data "archive_file" "bike_management_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/BikeInventory/bike_management.py"
  output_path = "${path.module}/../../packages/bike_management.zip"
  depends_on  = [local_file.create_bike_packages_dir]
}

# Bike Management Lambda Function
resource "aws_lambda_function" "bike_management" {
  filename         = data.archive_file.bike_management_zip.output_path
  function_name    = "dalscooter-bike-management"
  role             = aws_iam_role.bike_inventory_lambda_role.arn
  handler          = "bike_management.lambda_handler"
  runtime          = "python3.9"
  timeout          = 30
  source_code_hash = data.archive_file.bike_management_zip.output_base64sha256

  environment {
    variables = {
      BIKES_TABLE_NAME               = var.bikes_table_name
      DISCOUNT_CODES_TABLE_NAME      = var.discount_codes_table_name
      USER_DISCOUNT_USAGE_TABLE_NAME = var.user_discount_usage_table_name
      COGNITO_USER_POOL_ID           = var.cognito_user_pool_id
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.bike_management_log_group,
  ]
}

# CloudWatch Log Group for Bike Management Lambda
resource "aws_cloudwatch_log_group" "bike_management_log_group" {
  name              = "/aws/lambda/dalscooter-bike-management"
  retention_in_days = 14
}

# ================================
# DISCOUNT MANAGEMENT LAMBDA
# ================================

# Create a zip file for the Discount Management Lambda function
data "archive_file" "discount_management_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/BikeInventory/discount_management.py"
  output_path = "${path.module}/../../packages/discount_management.zip"
  depends_on  = [local_file.create_bike_packages_dir]
}

# Discount Management Lambda Function
resource "aws_lambda_function" "discount_management" {
  filename         = data.archive_file.discount_management_zip.output_path
  function_name    = "dalscooter-discount-management"
  role             = aws_iam_role.bike_inventory_lambda_role.arn
  handler          = "discount_management.lambda_handler"
  runtime          = "python3.9"
  timeout          = 30
  source_code_hash = data.archive_file.discount_management_zip.output_base64sha256

  environment {
    variables = {
      DISCOUNT_CODES_TABLE_NAME      = var.discount_codes_table_name
      USER_DISCOUNT_USAGE_TABLE_NAME = var.user_discount_usage_table_name
      COGNITO_USER_POOL_ID           = var.cognito_user_pool_id
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.discount_management_log_group,
  ]
}

# CloudWatch Log Group for Discount Management Lambda
resource "aws_cloudwatch_log_group" "discount_management_log_group" {
  name              = "/aws/lambda/dalscooter-discount-management"
  retention_in_days = 14
}

# ================================
# BIKE AVAILABILITY LAMBDA (PUBLIC)
# ================================

# Create a zip file for the Bike Availability Lambda function
data "archive_file" "bike_availability_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/BikeInventory/bike_availability.py"
  output_path = "${path.module}/../../packages/bike_availability.zip"
  depends_on  = [local_file.create_bike_packages_dir]
}

# Bike Availability Lambda Function (Public access)
resource "aws_lambda_function" "bike_availability" {
  filename         = data.archive_file.bike_availability_zip.output_path
  function_name    = "dalscooter-bike-availability"
  role             = aws_iam_role.bike_inventory_lambda_role.arn
  handler          = "bike_availability.lambda_handler"
  runtime          = "python3.9"
  timeout          = 30
  source_code_hash = data.archive_file.bike_availability_zip.output_base64sha256

  environment {
    variables = {
      BIKES_TABLE_NAME = var.bikes_table_name
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.bike_availability_log_group,
  ]
}

# CloudWatch Log Group for Bike Availability Lambda
resource "aws_cloudwatch_log_group" "bike_availability_log_group" {
  name              = "/aws/lambda/dalscooter-bike-availability"
  retention_in_days = 14
}

# ================================
# LOCAL FILES
# ================================

# Local file for creating packages directory
resource "local_file" "create_bike_packages_dir" {
  content  = "Bike inventory packages directory"
  filename = "${path.module}/../../packages/bike-inventory/.gitkeep"
}

# ================================
# OUTPUTS
# ================================

output "bike_management_lambda_arn" {
  description = "ARN of the bike management Lambda function"
  value       = aws_lambda_function.bike_management.arn
}

output "bike_management_lambda_invoke_arn" {
  description = "Invoke ARN of the bike management Lambda function"
  value       = aws_lambda_function.bike_management.invoke_arn
}

output "bike_management_lambda_function_name" {
  description = "Name of the bike management Lambda function"
  value       = aws_lambda_function.bike_management.function_name
}

output "discount_management_lambda_arn" {
  description = "ARN of the discount management Lambda function"
  value       = aws_lambda_function.discount_management.arn
}

output "discount_management_lambda_invoke_arn" {
  description = "Invoke ARN of the discount management Lambda function"
  value       = aws_lambda_function.discount_management.invoke_arn
}

output "discount_management_lambda_function_name" {
  description = "Name of the discount management Lambda function"
  value       = aws_lambda_function.discount_management.function_name
}

output "bike_availability_lambda_arn" {
  description = "ARN of the bike availability Lambda function"
  value       = aws_lambda_function.bike_availability.arn
}

output "bike_availability_lambda_invoke_arn" {
  description = "Invoke ARN of the bike availability Lambda function"
  value       = aws_lambda_function.bike_availability.invoke_arn
}

output "bike_availability_lambda_function_name" {
  description = "Name of the bike availability Lambda function"
  value       = aws_lambda_function.bike_availability.function_name
}
