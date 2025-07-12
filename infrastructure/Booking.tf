 

# # IAM Role for Lambda
# resource "aws_iam_role" "lambda_exec_role" {
#   name = "dal_lambda_exec_role"

#   assume_role_policy = jsonencode({
#     Version = "2012-10-17",
#     Statement = [{
#       Action = "sts:AssumeRole",
#       Effect = "Allow",
#       Principal = {
#         Service = "lambda.amazonaws.com"
#       }
#     }]
#   })
# }

# resource "aws_iam_role_policy_attachment" "lambda_basic" {
#   role       = aws_iam_role.lambda_exec_role.name
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
# }

# resource "aws_iam_role_policy_attachment" "lambda_sqs" {
#   role       = aws_iam_role.lambda_exec_role.name
#   policy_arn = "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
# }

# resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
#   role       = aws_iam_role.lambda_exec_role.name
#   policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
# }

# # SQS Queue
# resource "aws_sqs_queue" "booking_queue" {
#   name                        = "dal-booking-queue"
#   visibility_timeout_seconds  = 60
#   message_retention_seconds   = 345600
#   receive_wait_time_seconds   = 5
#   delay_seconds               = 0
# }

# # BookingRequest Lambda 
# resource "aws_lambda_function" "booking_request" {
#   function_name = "booking-request"
#   handler       = "booking_request.handler"
#   runtime       = "python3.9"
#   filename      = "${path.module}/BookingRequest/booking_req.zip"
#   role          = aws_iam_role.lambda_exec_role.arn

#   environment {
#     variables = {
#       SQS_QUEUE_URL       = aws_sqs_queue.booking_queue.id
#       BOOKING_TABLE_NAME  = "Bookings"
#     }
#   }

#   depends_on = [
#     aws_iam_role.lambda_exec_role,
#     aws_sqs_queue.booking_queue
#   ]
# }

# # BookingApproval Lambda 
# resource "aws_lambda_function" "booking_approval" {
#   function_name = "booking-approval"
#   handler       = "booking_approval.handler"
#   runtime       = "python3.9"
#   filename      = "${path.module}/BookingApproval/booking_approve.zip"
#   role          = aws_iam_role.lambda_exec_role.arn

#   environment {
#     variables = {
#       BOOKING_TABLE_NAME = "Bookings"
#     }
#   }

#   depends_on = [
#     aws_iam_role.lambda_exec_role
#   ]
# }

# # SQS → BookingApproval Lambda Trigger
# resource "aws_lambda_event_source_mapping" "sqs_trigger" {
#   event_source_arn = aws_sqs_queue.booking_queue.arn
#   function_name    = aws_lambda_function.booking_approval.arn
#   batch_size       = 1
#   enabled          = true
# }
