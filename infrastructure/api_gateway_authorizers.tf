# ================================
# AUTHORIZERS
# ================================

# Customer Authorizer
resource "aws_api_gateway_authorizer" "customer_authorizer" {
  name                   = "customer-authorizer"
  rest_api_id           = aws_api_gateway_rest_api.dalscooter_apis.id
  authorizer_uri        = aws_lambda_function.customer_authenticator.invoke_arn
  authorizer_credentials = aws_iam_role.authorizer_invocation_role.arn
  type                  = "TOKEN"
  identity_source       = "method.request.header.Authorization"
}

# Franchise Authorizer
resource "aws_api_gateway_authorizer" "franchise_authorizer" {
  name                   = "franchise-authorizer"
  rest_api_id           = aws_api_gateway_rest_api.dalscooter_apis.id
  authorizer_uri        = aws_lambda_function.admin_authenticator.invoke_arn
  authorizer_credentials = aws_iam_role.authorizer_invocation_role.arn
  type                  = "TOKEN"
  identity_source       = "method.request.header.Authorization"
}

# ================================
# IAM ROLE FOR AUTHORIZERS
# ================================

resource "aws_iam_role" "authorizer_invocation_role" {
  name = "api_gateway_authorizer_invocation_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "authorizer_invocation_policy" {
  name = "api_gateway_authorizer_invocation_policy"
  role = aws_iam_role.authorizer_invocation_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "lambda:InvokeFunction"
        Effect   = "Allow"
        Resource = [
          aws_lambda_function.customer_authenticator.arn,
          aws_lambda_function.admin_authenticator.arn
        ]
      }
    ]
  })
}
