output "bot_id" {
  value = aws_lexv2models_bot.chatbot.id
}

output "locale_id" {
  value = aws_lexv2models_bot_locale.chatbot_locale.locale_id
}

output "bot_handler_lambda_invoke_arn" {
  description = "Invoke ARN of the post feedback Lambda function"
  value       = aws_lambda_function.bot_handler.invoke_arn
}


output "bot_handler_lambda" {
  description = "Invoke ARN of the post feedback Lambda function"
  value       = aws_lambda_function.bot_handler
}
