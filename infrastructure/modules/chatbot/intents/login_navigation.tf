resource "aws_lexv2models_intent" "navigation_login" {
  bot_id      = var.bot_id
  bot_version = "DRAFT"
  name        = "login_intent"
  locale_id   = var.locale_id
  description = "Navigate to the login page"

   sample_utterance {
    utterance = "How do I login?"
   }
  sample_utterance {
    utterance = "I want to login"
    }
  sample_utterance {
    utterance = "Login"
  }
  sample_utterance {
    utterance = "I need to login"
  }
  sample_utterance {
    utterance = "Can you help me login?"
  }
  sample_utterance {
    utterance = "I want to access my account"
  }
  sample_utterance {
    utterance = "How can I access my account?"
  }
  sample_utterance {
    utterance = "I want to sign in"
  }
  sample_utterance {
    utterance = "I need to sign in"
  }
  sample_utterance {
    utterance = "Can you help me sign in?"
  }
  sample_utterance {
    utterance = "I want to access my profile"
  }
  sample_utterance {
    utterance = "How can I access my profile?"
  }

  initial_response_setting {
    initial_response {
      message_group {
        message {
          plain_text_message {
            value = "For login, please click on the account icon at the top right corner of the page. If you need further assistance, please let me know."
          }
        }
      }
    }
  }
}