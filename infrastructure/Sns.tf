resource "aws_sns_topic" "user_signup_login" {
  name = "dalscooter-user-signup-login"
}

resource "aws_sns_topic_subscription" "notify_signup" {
  topic_arn = aws_sns_topic.user_signup_login.arn
  protocol  = "lambda"
  endpoint  = module.lambda.notification_lambda_arn
}

resource "aws_lambda_permission" "allow_sns_invoke_notification" {
  statement_id  = "AllowSNSInvokeNotification"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda.notification_lambda_function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.user_signup_login.arn
}
