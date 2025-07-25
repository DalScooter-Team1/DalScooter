# ================================
# SQS QUEUE FOR CUSTOMER CONCERNS
# ================================
# This queue handles customer message submissions for peak traffic management

resource "aws_sqs_queue" "concerns_queue" {
  name                       = "dalscooter-concerns-queue"
  visibility_timeout_seconds = 120   # Increased to accommodate Lambda timeout
  message_retention_seconds  = 86400 # 1 day
  receive_wait_time_seconds  = 5     # Long polling
  delay_seconds              = 0     # No delay

  tags = {
    Name    = "DALScooter Concerns Queue"
    Project = "DALScooter"
  }
}

# Dead Letter Queue for failed messages
resource "aws_sqs_queue" "concerns_dlq" {
  name                      = "dalscooter-concerns-dlq"
  message_retention_seconds = 1209600 # 14 days

  tags = {
    Name    = "DALScooter Concerns Dead Letter Queue"
    Project = "DALScooter"
  }
}

# Configure main queue with DLQ
resource "aws_sqs_queue_redrive_policy" "concerns_queue_redrive" {
  queue_url = aws_sqs_queue.concerns_queue.id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.concerns_dlq.arn
    maxReceiveCount     = 3
  })
}

# Outputs
output "concerns_queue_arn" {
  description = "ARN of the concerns SQS queue"
  value       = aws_sqs_queue.concerns_queue.arn
}

output "concerns_queue_url" {
  description = "URL of the concerns SQS queue"
  value       = aws_sqs_queue.concerns_queue.id
}

output "concerns_dlq_arn" {
  description = "ARN of the concerns dead letter queue"
  value       = aws_sqs_queue.concerns_dlq.arn
}
