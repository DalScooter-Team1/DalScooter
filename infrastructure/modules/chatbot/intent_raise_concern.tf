############################
# For Customer: Raise a Concern for Booking Intent
############################
resource "aws_lexv2models_intent" "raise_concern" {
  bot_id      = aws_lexv2models_bot.chatbot.id
  bot_version = "DRAFT"
  locale_id   = var.locale_id
  name        = "raise_concern_intent"
  description = "As customer, raise a issue/concern for the booking."

  # non‑slot utterances
  sample_utterance { utterance = "I have an issue" }
  sample_utterance { utterance = "Raise a concern" }
  sample_utterance { utterance = "Report a problem" }
  sample_utterance { utterance = "I want to raise a concern" }
  sample_utterance { utterance = "raise a ticket" }
  sample_utterance { utterance = "Report an issue" }


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
resource "aws_lexv2models_slot" "booking_reference_concern" {
  bot_id       = aws_lexv2models_bot.chatbot.id
  bot_version  = "DRAFT"
  intent_id    = aws_lexv2models_intent.raise_concern.intent_id
  locale_id    = var.locale_id
  name         = "booking_reference_concern"
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

  depends_on = [ aws_lexv2models_intent.raise_concern ]
}

############################
# Patch Intent via AWS CLI
# (adds the slot‑placeholder utterances,
#  sets slot priority, and hooks Lambda)
############################
resource "null_resource" "update_raise_concern_intent_with_slot_priority" {
  triggers = {
    intent_id = aws_lexv2models_intent.raise_concern.intent_id
    slot_id   = aws_lexv2models_slot.booking_reference_concern.slot_id
  }

  provisioner "local-exec" {
    command = <<EOT
      aws lexv2-models update-intent \
        --intent-id ${aws_lexv2models_intent.raise_concern.intent_id} \
        --intent-name raise_concern_intent \
        --description "As customer, raise a issue/concern for the booking." \
        --bot-id ${aws_lexv2models_bot.chatbot.id} \
        --bot-version DRAFT \
        --locale-id ${var.locale_id} \
        --sample-utterances '[
          {"utterance": "I have an issue"},
          {"utterance": "Raise a concern"},
          {"utterance": "Report a problem"},
          {"utterance": "I want to raise a concern"},
          {"utterance": "raise a ticket"},
          {"utterance": "Report an issue"},
          {"utterance": "My booking reference is {booking_reference_concern}"},
          {"utterance": "The reference is {booking_reference_concern}"}
        ]' \
        --fulfillment-code-hook enabled=true \
        --slot-priorities priority=1,slotId=${aws_lexv2models_slot.booking_reference_concern.slot_id}
    EOT
  }

  depends_on = [
    aws_lexv2models_intent.raise_concern,
    aws_lexv2models_slot.booking_reference_concern
  ]
}
