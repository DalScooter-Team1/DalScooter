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
  sample_utterance { utterance = "add bike" }

  initial_response_setting {
    initial_response {
      message_group {
        message {
          plain_text_message {
            value = "As Franchise once you logged in, Go to Scooters tab from left panel -> Click Add New Bike -> Enter bike details -> Click Add Bike at bottom left of model. Boom! Now your bike is added."
          }
        }
      }
    }
  }

  depends_on = [
    aws_lexv2models_bot_locale.chatbot_locale
  ]
}
