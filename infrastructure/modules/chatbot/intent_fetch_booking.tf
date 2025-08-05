############################
# For Customer: Fetch access code for Booking Intent
############################
resource "aws_lexv2models_intent" "fetch_booking" {
  bot_id      = aws_lexv2models_bot.chatbot.id
  bot_version = "DRAFT"
  locale_id   = var.locale_id
  name        = "fetch_booking_intent"
  description = "Fetch the access code for your booking."

  # 1) Only the non‑slot utterances here
  sample_utterance { utterance = "What is my booking status?" }
  sample_utterance { utterance = "I want access code" }
  sample_utterance { utterance = "Give me my access code" }
  sample_utterance { utterance = "Access code please" }
  sample_utterance { utterance = "How do I get my access code?" }

  fulfillment_code_hook {
    enabled = true
  }

  lifecycle {
    ignore_changes = [ sample_utterance ]
  }

  depends_on = [
    aws_lexv2models_bot_locale.chatbot_locale
  ]
}

############################
# Booking Reference Slot
############################
resource "aws_lexv2models_slot" "booking_reference_booking" {
  bot_id       = aws_lexv2models_bot.chatbot.id
  bot_version  = "DRAFT"
  intent_id    = aws_lexv2models_intent.fetch_booking.intent_id
  locale_id    = var.locale_id
  name         = "booking_reference_customer"
  slot_type_id = "AMAZON.AlphaNumeric"

  value_elicitation_setting {
    slot_constraint = "Required"

    prompt_specification {
      allow_interrupt            = true
      max_retries                = 1
      message_selection_strategy = "Random"

      message_group {
        message {
          plain_text_message {
            value = "Please tell me your booking reference."
          }
        }
      }
      prompt_attempts_specification {
        allow_interrupt = true
        map_block_key   = "Initial"

        allowed_input_types {
          allow_audio_input = true
          allow_dtmf_input  = true
        }

        audio_and_dtmf_input_specification {
          start_timeout_ms = 4000

          audio_specification {
            end_timeout_ms = 640
            max_length_ms  = 15000
          }

          dtmf_specification {
            deletion_character = "*"
            end_character      = "#"
            end_timeout_ms     = 5000
            max_length         = 513
          }
        }

        text_input_specification {
          start_timeout_ms = 30000
        }
      }

      prompt_attempts_specification {
        allow_interrupt = true
        map_block_key   = "Retry1"

        allowed_input_types {
          allow_audio_input = true
          allow_dtmf_input  = true
        }

        audio_and_dtmf_input_specification {
          start_timeout_ms = 4000

          audio_specification {
            end_timeout_ms = 640
            max_length_ms  = 15000
          }

          dtmf_specification {
            deletion_character = "*"
            end_character      = "#"
            end_timeout_ms     = 5000
            max_length         = 513
          }
        }

        text_input_specification {
          start_timeout_ms = 30000
        }
      }

    }
  }

 

  depends_on = [ aws_lexv2models_intent.fetch_booking ]
}

############################
# Patch Intent via AWS CLI
# (adds the slot‑placeholder utterances,
#  sets slot priority, and hooks Lambda)
############################
resource "null_resource" "update_fetch_booking_intent_with_slot_priority" {
  triggers = {
    intent_id = aws_lexv2models_intent.fetch_booking.intent_id
    slot_id   = aws_lexv2models_slot.booking_reference_booking.slot_id
  }

  provisioner "local-exec" {
    command = <<EOT
      aws lexv2-models update-intent \
        --intent-id ${aws_lexv2models_intent.fetch_booking.intent_id} \
        --intent-name fetch_booking_intent \
        --description "Fetch the access code for your booking." \
        --bot-id ${aws_lexv2models_bot.chatbot.id} \
        --bot-version DRAFT \
        --locale-id ${var.locale_id} \
        --sample-utterances '[
          {"utterance": "What is my booking status?"},
          {"utterance": "I want access code"},
          {"utterance": "Give me my access code"},
          {"utterance": "Access code please"},
          {"utterance": "How do I get my access code?"},
          {"utterance": "My booking reference is {booking_reference_customer}"},
          {"utterance": "The reference is {booking_reference_customer}"}]' \
        --fulfillment-code-hook enabled=true \
        --slot-priorities priority=1,slotId=${aws_lexv2models_slot.booking_reference_booking.slot_id}
    EOT
  }

  depends_on = [
    aws_lexv2models_intent.fetch_booking,
    aws_lexv2models_slot.booking_reference_booking
  ]
}
