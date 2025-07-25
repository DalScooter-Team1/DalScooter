resource "aws_lexv2models_intent" "welcome_intent" {
  bot_id      = var.bot_id
  bot_version = "DRAFT"
  name        = "welcome_intent"
  locale_id   = var.locale_id
  description = "Intent to welcome the users."
  
  #Utterences
  sample_utterance {
    utterance = "Hi"
  }
    sample_utterance {
        utterance = "Hello"
    }

    sample_utterance {
        utterance = "Hey"
    }
    sample_utterance {
        utterance = "Greetings"

    }
    sample_utterance {
        utterance = "Welcome"
    }
    sample_utterance {
        utterance = "Good morning"  
    }
    sample_utterance {
        utterance = "Good afternoon"
    }
    sample_utterance {
        utterance = "Good evening"
    }
    sample_utterance {
        utterance = "Good night"
    }
    sample_utterance {
        utterance = "How are you?"
    }

    #Intial Response
    initial_response_setting {
      initial_response {
        message_group {
          message {
            plain_text_message {
              value = "Hello!👋🏻 I am DalAssistant🐯, your virtual assistant for DalScooter. How can I assist you today?"
            }
          }
        }
      }
    }
}