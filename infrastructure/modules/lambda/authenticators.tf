# ================================
# AUTHENTICATOR LAMBDA FUNCTIONS
# ================================

# ================================
# CUSTOMER AUTHENTICATOR LAMBDA
# ================================

data "archive_file" "customer_authenticator_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/User Management/customer_authenticator_simple.py"
  output_path = "${path.module}/../../packages/customer_authenticator.zip"
  depends_on  = [local_file.create_packages_dir]
}

resource "aws_lambda_function" "customer_authenticator" {
  filename         = data.archive_file.customer_authenticator_zip.output_path
  function_name    = "dalscooter-customer-authenticator"
  role            = aws_iam_role.auth_lambda_role.arn
  handler         = "customer_authenticator_simple.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  source_code_hash = data.archive_file.customer_authenticator_zip.output_base64sha256

  environment {
    variables = {
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
      COGNITO_CLIENT_ID    = var.cognito_client_id
    }
  }
}

# ================================
# ADMIN AUTHENTICATOR LAMBDA
# ================================

data "archive_file" "admin_authenticator_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/User Management/admin_authenticator_simple.py"
  output_path = "${path.module}/../../packages/admin_authenticator.zip"
  depends_on  = [local_file.create_packages_dir]
}

resource "aws_lambda_function" "admin_authenticator" {
  filename         = data.archive_file.admin_authenticator_zip.output_path
  function_name    = "dalscooter-admin-authenticator"
  role            = aws_iam_role.auth_lambda_role.arn
  handler         = "admin_authenticator_simple.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  source_code_hash = data.archive_file.admin_authenticator_zip.output_base64sha256

  environment {
    variables = {
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
      COGNITO_CLIENT_ID    = var.cognito_client_id
    }
  }
}
