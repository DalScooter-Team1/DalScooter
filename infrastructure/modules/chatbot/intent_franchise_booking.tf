############################
# For Franchise: Fetch Bike Number for Booking Intent
############################
resource "aws_lexv2models_intent" "franchise_booking" {
  bot_id      = aws_lexv2models_bot.chatbot.id
  bot_version = "DRAFT"
  locale_id   = var.locale_id
  name        = "franchise_booking_intent"
  description = "As Franchise, Fetch the bike number for your booking."

  # non‑slot utterances
  sample_utterance { utterance = "Give me bike number" }
  sample_utterance { utterance = "Bike number please" }
  sample_utterance { utterance = "Get bike number" }

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
resource "aws_lexv2models_slot" "booking_reference_bike" {
  bot_id       = aws_lexv2models_bot.chatbot.id
  bot_version  = "DRAFT"
  intent_id    = aws_lexv2models_intent.franchise_booking.intent_id
  locale_id    = var.locale_id
  name         = "booking_reference_franchise"
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
  depends_on = [ aws_lexv2models_intent.franchise_booking ]
}

############################
# Patch Intent via AWS CLI
# (adds the slot‑placeholder utterances,
#  sets slot priority, and hooks Lambda)
############################
resource "null_resource" "update_intent_with_slot_priority" {
  triggers = {
    intent_id = aws_lexv2models_intent.franchise_booking.intent_id
    slot_id   = aws_lexv2models_slot.booking_reference_bike.slot_id
  }

  provisioner "local-exec" {
    command = <<EOT
      aws lexv2-models update-intent \
        --intent-id ${aws_lexv2models_intent.franchise_booking.intent_id} \
        --intent-name franchise_booking_intent \
        --bot-id ${aws_lexv2models_bot.chatbot.id} \
        --bot-version DRAFT \
        --locale-id ${var.locale_id} \
        --slot-priorities priority=1,slotId=${aws_lexv2models_slot.booking_reference_bike.slot_id}
    EOT
  }

  depends_on = [
    aws_lexv2models_intent.franchise_booking,
    aws_lexv2models_slot.booking_reference_bike
  ]
}
