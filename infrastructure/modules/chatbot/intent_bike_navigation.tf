############################
# For Franchise: Bike Navigation Intent
############################
resource "aws_lexv2models_intent" "bike_navigation" {
  bot_id      = aws_lexv2models_bot.chatbot.id
  bot_version = "DRAFT"
  locale_id   = var.locale_id
  name        = "bike_navigation_intent"
  description = "bike navigation for franchise."

  sample_utterance { utterance = "how to add bike" }
  sample_utterance { utterance = "steps to add bike" }

  initial_response_setting {
    initial_response {
      message_group {
        message {
          plain_text_message {
            value = "After logging in, Go to Bikes panel -> Click Add button -> Enter bike details -> Submit by clicking Add button. Boom! Now your bike is added."
          }
        }
      }
    }
  }

  depends_on = [
    aws_lexv2models_bot_locale.chatbot_locale
  ]
}
