############################
# For Customer: Bike Navigation Intent
############################
resource "aws_lexv2models_intent" "booking_navigation" {
  bot_id      = aws_lexv2models_bot.chatbot.id
  bot_version = "DRAFT"
  locale_id   = var.locale_id
  name        = "booking_navigation_intent"
  description = "booking navigation for Customer."

  sample_utterance { utterance = "how to book a bike" }
  sample_utterance { utterance = "how to do booking" }
  sample_utterance { utterance = "book a bike" }
  sample_utterance { utterance = "steps to book a bike" }
  sample_utterance { utterance = "steps for booking a bike" }


  initial_response_setting {
    initial_response {
      message_group {
        message {
          plain_text_message {
            value = "After logging in, Go to Booking panel -> Click Book button -> Enter booking details -> Submit by clicking Book button. Boom! Now your booking is done."
          }
        }
      }
    }
  }

  depends_on = [
    aws_lexv2models_bot_locale.chatbot_locale
  ]
}
