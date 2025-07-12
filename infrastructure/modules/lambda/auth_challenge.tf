# ================================
# AUTH CHALLENGE LAMBDA FUNCTIONS
# ================================

# IAM Role for Auth Lambda Functions
resource "aws_iam_role" "auth_lambda_role" {
  name = "dalscooter-auth-lambda-role"

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

# IAM Policy for Auth Lambda Functions
resource "aws_iam_role_policy" "auth_lambda_policy" {
  name = "dalscooter-auth-lambda-policy"
  role = aws_iam_role.auth_lambda_role.id

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
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = var.security_questions_table_arn
      }
    ]
  })
}

# ================================
# DEFINE AUTH CHALLENGE LAMBDA
# ================================

data "archive_file" "define_auth_challenge_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/User Management/define_auth_challenge.py"
  output_path = "${path.module}/../../packages/define_auth_challenge.zip"
  depends_on  = [local_file.create_packages_dir]
}

resource "aws_lambda_function" "define_auth_challenge" {
  filename         = data.archive_file.define_auth_challenge_zip.output_path
  function_name    = "dalscooter-define-auth-challenge"
  role            = aws_iam_role.auth_lambda_role.arn
  handler         = "define_auth_challenge.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  source_code_hash = data.archive_file.define_auth_challenge_zip.output_base64sha256
}

# ================================
# CREATE AUTH CHALLENGE LAMBDA
# ================================

data "archive_file" "create_auth_challenge_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/User Management/create_auth_challenge.py"
  output_path = "${path.module}/../../packages/create_auth_challenge.zip"
  depends_on  = [local_file.create_packages_dir]
}

resource "aws_lambda_function" "create_auth_challenge" {
  filename         = data.archive_file.create_auth_challenge_zip.output_path
  function_name    = "dalscooter-create-auth-challenge"
  role            = aws_iam_role.auth_lambda_role.arn
  handler         = "create_auth_challenge.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  source_code_hash = data.archive_file.create_auth_challenge_zip.output_base64sha256

  environment {
    variables = {
      SECURITY_QUESTIONS_TABLE = var.security_questions_table_name
    }
  }
}

# ================================
# VERIFY AUTH CHALLENGE LAMBDA
# ================================

data "archive_file" "verify_auth_challenge_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/User Management/verify_auth_challenge.py"
  output_path = "${path.module}/../../packages/verify_auth_challenge.zip"
  depends_on  = [local_file.create_packages_dir]
}

resource "aws_lambda_function" "verify_auth_challenge" {
  filename         = data.archive_file.verify_auth_challenge_zip.output_path
  function_name    = "dalscooter-verify-auth-challenge"
  role            = aws_iam_role.auth_lambda_role.arn
  handler         = "verify_auth_challenge.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  source_code_hash = data.archive_file.verify_auth_challenge_zip.output_base64sha256

  environment {
    variables = {
      SECURITY_QUESTIONS_TABLE = var.security_questions_table_name
    }
  }
}
