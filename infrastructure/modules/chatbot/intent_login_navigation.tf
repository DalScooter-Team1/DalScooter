############################
# Public: Login Navigation Intent
############################
resource "aws_lexv2models_intent" "login_navigation" {
  bot_id      = aws_lexv2models_bot.chatbot.id
  bot_version = "DRAFT"
  locale_id   = var.locale_id
  name        = "login_navigation_intent"
  description = "Guide user to the login page."

  sample_utterance { utterance = "How do I login" }
  sample_utterance { utterance = "I want to login" }
  sample_utterance { utterance = "Login" }
  sample_utterance { utterance = "Signin" }
  sample_utterance { utterance = "steps to sign in" }

  initial_response_setting {
    initial_response {
      message_group {
        message {
          plain_text_message {
            value = "To log in, click the Log In button at the top right of the page."
          }
        }
      }
    }
  }
  depends_on = [
    aws_lexv2models_bot_locale.chatbot_locale
  ]
}
