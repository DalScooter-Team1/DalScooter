resource "aws_sqs_queue" "feedback_queue" {
  name                       = "dalscooter-feedback-queue"
  visibility_timeout_seconds = 120  # Increased to accommodate Lambda timeout
  message_retention_seconds  = 86400 # 1 day
}