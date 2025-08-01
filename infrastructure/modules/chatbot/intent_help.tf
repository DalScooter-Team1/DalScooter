############################
# Public: Help Intent
############################
resource "aws_lexv2models_intent" "help" {
  bot_id      = aws_lexv2models_bot.chatbot.id
  bot_version = "DRAFT"
  locale_id   = var.locale_id
  name        = "help_intent"
  description = "help for all."

  sample_utterance { utterance = "I need help" }
  sample_utterance { utterance = "I need support" }
  sample_utterance { utterance = "contact for help" }
  sample_utterance { utterance = "contact for support" }
  sample_utterance { utterance = "contact details for help" }
  sample_utterance { utterance = "contact details for support" }
  sample_utterance { utterance = "help" }
  sample_utterance { utterance = "support" }


  initial_response_setting {
    initial_response {
      message_group {
        message {
          plain_text_message {
            value = "Here is contact details for general support. Phone: +1 (902) 123 4567 or Email: support@dalscooter.ca"
          }
        }
      }
    }
  }

  depends_on = [
    aws_lexv2models_bot_locale.chatbot_locale
  ]
}
