# ================================
# API GATEWAY MODULE OUTPUTS
# ================================

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = aws_api_gateway_rest_api.dalscooter_apis.id
}

output "api_gateway_arn" {
  description = "ARN of the API Gateway"
  value       = aws_api_gateway_rest_api.dalscooter_apis.arn
}

output "api_gateway_execution_arn" {
  description = "Execution ARN of the API Gateway"
  value       = aws_api_gateway_rest_api.dalscooter_apis.execution_arn
}

output "api_gateway_invoke_url" {
  description = "Invoke URL of the API Gateway deployment"
  value       = aws_api_gateway_deployment.registration_deployment.invoke_url
}

output "api_gateway_stage_name" {
  description = "Stage name of the API Gateway deployment"
  value       = aws_api_gateway_deployment.registration_deployment.stage_name
}

output "api_gateway_root_resource_id" {
  description = "Root resource ID of the API Gateway"
  value       = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
}

# ================================
# DEPLOYMENT OUTPUTS
# ================================

output "api_gateway_deployment_id" {
  description = "ID of the API Gateway deployment"
  value       = aws_api_gateway_deployment.registration_deployment.id
}

output "api_gateway_deployment_invoke_url" {
  description = "Invoke URL of the API Gateway deployment (alias for api_gateway_invoke_url)"
  value       = aws_api_gateway_deployment.registration_deployment.invoke_url
}

# ================================
# AUTHORIZER OUTPUTS
# ================================

output "customer_authorizer_id" {
  description = "ID of the customer authorizer"
  value       = aws_api_gateway_authorizer.customer_authorizer.id
}
output "franchise_authorizer_id" {
  description = "ID of the franchise authorizer"
  value       = aws_api_gateway_authorizer.franchise_authorizer.id
}

# ================================
# RESOURCE OUTPUTS
# ================================

output "register_resource_id" {
  description = "ID of the register resource"
  value       = aws_api_gateway_resource.register.id
}

output "admin_resource_id" {
  description = "ID of the admin resource"
  value       = aws_api_gateway_resource.admin.id
}

# ================================
# LAMBDA FUNCTION OUTPUTS
# ================================

output "submit_concern_lambda_arn" {
  description = "ARN of the submit concern Lambda function"
  value       = var.submit_concern_lambda_arn
}

output "submit_concern_lambda_invoke_arn" {
  description = "Invoke ARN of the submit concern Lambda function"
  value       = var.submit_concern_lambda_invoke_arn
}

output "respond_concern_lambda_arn" {
  description = "ARN of the respond concern Lambda function"
  value       = var.respond_concern_lambda_arn
}

output "respond_concern_lambda_invoke_arn" {
  description = "Invoke ARN of the respond concern Lambda function"
  value       = var.respond_concern_lambda_invoke_arn
}

output "get_concerns_lambda_arn" {
  description = "ARN of the get concerns Lambda function"
  value       = var.get_concerns_lambda_arn
}

output "get_concerns_lambda_invoke_arn" {
  description = "Invoke ARN of the get concerns Lambda function"
  value       = var.get_concerns_lambda_invoke_arn
}

output "feedback_resource_id" {
  description = "ID of the feedback resource"
  value       = aws_api_gateway_resource.feedback.id
}
