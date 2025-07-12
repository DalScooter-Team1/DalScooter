# ================================
# USER REGISTRATION LAMBDA
# ================================

# IAM Role for Registration Lambda
resource "aws_iam_role" "registration_lambda_role" {
  name = "dalscooter-registration-lambda-role"

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

resource "aws_iam_role_policy" "registration_lambda_policy" {
  name = "dalscooter-registration-lambda-policy"
  role = aws_iam_role.registration_lambda_role.id

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
        Effect   = "Allow"
        Action   = [
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminSetUserPassword",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:AdminAddUserToGroup"
        ]
        Resource = var.cognito_user_pool_arn
      },
      {
        Effect   = "Allow"
        Action   = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = var.security_questions_table_arn
      },
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = var.signup_login_topic_arn
      }
    ]
  })
}

# Create a zip file for the Lambda function from the Registration.py file
data "archive_file" "user_registration_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/User Management/Registration.py"
  output_path = "${path.module}/../../packages/user_registration.zip"
  depends_on  = [local_file.create_packages_dir]
}

resource "aws_lambda_function" "user_registration" {
  filename         = data.archive_file.user_registration_zip.output_path
  function_name    = "dalscooter-user-registration"
  role            = aws_iam_role.registration_lambda_role.arn
  handler         = "Registration.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  
  source_code_hash = data.archive_file.user_registration_zip.output_base64sha256

  environment {
    variables = {
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
      COGNITO_CLIENT_ID    = var.cognito_client_id
      SECURITY_QUESTIONS_TABLE = var.security_questions_table_name
      SIGNUP_LOGIN_TOPIC_ARN     = var.signup_login_topic_arn
    }
  }
}
