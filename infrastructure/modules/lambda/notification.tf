# ================================
# NOTIFICATION LAMBDA
# ================================

resource "aws_iam_role" "notification_lambda_role" {
  name = "dalscooter-notification-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "notification_lambda_policy" {
  name = "dalscooter-notification-lambda-policy"
  role = aws_iam_role.notification_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect   = "Allow"
        Action   = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda Function Package
data "archive_file" "notification_zip" {
  type        = "zip"
  source_file = "${path.module}/../../backend/Notification/notification_email_sender.py"
  output_path = "${path.module}/../../packages/notification_email_sender.zip"
  depends_on  = [local_file.create_packages_dir]
}

resource "aws_lambda_function" "notification" {
  filename         = data.archive_file.notification_zip.output_path
  function_name    = "dalscooter-notification"
  role             = aws_iam_role.notification_lambda_role.arn
  handler          = "notification_email_sender.lambda_handler"
  runtime          = "python3.9"
  timeout          = 30
  source_code_hash = data.archive_file.notification_zip.output_base64sha256

  environment {
    variables = {
      SES_REGION       = "us-east-1"
      SES_FROM_ADDRESS = "vb677883@dal.ca"
    }
  }
}
