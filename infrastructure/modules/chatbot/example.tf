resource "aws_lexv2models_intent" "example" {
  bot_id      = aws_lexv2models_bot.dalscooter_chatbot.id
  bot_version = "DRAFT"
  name        = "example_intent"
  locale_id   = aws_lexv2models_bot_locale.dalscooter_chatbot_locale.locale_id
  description = "An example intent for the DalScooter chatbot"
  sample_utterance {
    utterance = "I want to order flowers"
  }

    initial_response_setting {
      initial_response {
        message_group {
            message {
              plain_text_message {
                value = "Your order for flowers has been placed."
              }
            }
          }
        }
      }

}