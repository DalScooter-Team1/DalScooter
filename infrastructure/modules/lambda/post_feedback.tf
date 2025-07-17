# ================================
# LAMBDA FUNCTION TO POST FEEDBACK
# ================================
# This lambda function takes feedback from the customers and stores it in DynamoDB

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
  name           = "dalscooter-feedback"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "email"
  range_key      = "timestamp"
  
  attribute {
    name = "email"
    type = "S"
  }
  attribute {
    name = "timestamp"
    type = "S"
  }


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
    function_name = "dalscooter-post-feedback-lambda"
    role          = aws_iam_role.post_feedback_lambda_role.arn
    handler       = "post_feedback.lambda_handler"
    runtime       = "python3.9"
    filename      = data.archive_file.post_feedback_zip.output_path
    source_code_hash = data.archive_file.post_feedback_zip.output_base64sha256
    timeout       = 30
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
