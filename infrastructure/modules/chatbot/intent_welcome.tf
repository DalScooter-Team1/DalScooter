############################
# Welcome Intent
############################
resource "aws_lexv2models_intent" "welcome" {
  bot_id      = aws_lexv2models_bot.chatbot.id
  bot_version = "DRAFT"
  locale_id   = var.locale_id
  name        = "welcome_intent"
  description = "Greet the user."

  sample_utterance { utterance = "Hi" }
  sample_utterance { utterance = "Hello" }
  sample_utterance { utterance = "Hey" }
  sample_utterance { utterance = "Good morning" }

  initial_response_setting {
    initial_response {
      message_group {
        message {
          plain_text_message {
            value = "Hello! I am DalAssistant, your virtual assistant. How can I help today?"
          }
        }
      }
    }
  }

  depends_on = [
    aws_lexv2models_bot_locale.chatbot_locale
  ]
}
