############################
# Register Navigation Intent
############################
resource "aws_lexv2models_intent" "register_navigation" {
  bot_id      = aws_lexv2models_bot.chatbot.id
  bot_version = "DRAFT"
  locale_id   = var.locale_id
  name        = "register_navigation_intent"
  description = "Guide user to the login page."

  sample_utterance { utterance = "How do I register" }
  sample_utterance { utterance = "I want to register" }
  sample_utterance { utterance = "Register" }
  sample_utterance { utterance = "steps to register" }
  sample_utterance { utterance = "How do I signup" }
  sample_utterance { utterance = "I want to signup" }
  sample_utterance { utterance = "Signup" }
  sample_utterance { utterance = "steps to signup" }

  initial_response_setting {
    initial_response {
      message_group {
        message {
          plain_text_message {
            value = "To Register, click the SIgn Up button at the top right of the page."
          }
        }
      }
    }
  }
  depends_on = [
    aws_lexv2models_bot_locale.chatbot_locale
  ]
}
