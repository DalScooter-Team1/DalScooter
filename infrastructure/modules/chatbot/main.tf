# Allow data lookup of account ID
data "aws_caller_identity" "current" {}

############################
# IAM Role for Lex Bot
############################
resource "aws_iam_role" "chatbot_role" {
  name = "${var.bot_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lexv2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

############################
# The Lex V2 Bot
############################
resource "aws_lexv2models_bot" "chatbot" {
  name                         = var.bot_name
  description                  = "Chatbot for DalScooter"
  role_arn                     = aws_iam_role.chatbot_role.arn
  data_privacy { child_directed = false }
  idle_session_ttl_in_seconds  = 60
  type                         = "Bot"

  tags = {
    Name    = var.bot_name
    Project = "DALScooter"
  }
}

############################
# Bot Locale
############################
resource "aws_lexv2models_bot_locale" "chatbot_locale" {
  bot_id                    = aws_lexv2models_bot.chatbot.id
  bot_version               = "DRAFT"
  locale_id                 = var.locale_id
  n_lu_intent_confidence_threshold  = 0.7
}
