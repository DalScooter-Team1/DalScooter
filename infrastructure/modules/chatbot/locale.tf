resource "aws_lexv2models_bot_locale" "dalscooter_chatbot_locale" {
  #Attachment to the chatbot bot
  bot_id                           = aws_lexv2models_bot.dalscooter_chatbot.id
  bot_version                      = "DRAFT"
  locale_id                        = "en_US"
  n_lu_intent_confidence_threshold = 0.70
}