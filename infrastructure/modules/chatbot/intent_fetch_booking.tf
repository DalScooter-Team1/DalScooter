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
      max_retries                = 2
      message_selection_strategy = "Random"

      message_group {
        message {
          plain_text_message {
            value = "Please tell me your booking reference."
          }
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
resource "null_resource" "patch_fetch_booking_intent" {
  triggers = {
    bot_id     = aws_lexv2models_bot.chatbot.id
    locale_id  = var.locale_id
    intent_id  = aws_lexv2models_intent.fetch_booking.intent_id
    slot_id    = aws_lexv2models_slot.booking_reference_booking.slot_id
  }

  provisioner "local-exec" {
    interpreter = ["bash", "-c"]
    command = <<-EOT
      aws lexv2-models update-intent \
        --bot-id ${self.triggers.bot_id} \
        --bot-version DRAFT \
        --locale-id ${self.triggers.locale_id} \
        --intent-id ${self.triggers.intent_id} \
        --intent-name fetch_booking_intent \
        --sample-utterances '[{"utterance":"What is my booking status?"},{"utterance":"I want access code"},{"utterance":"Give me my access code"},{"utterance":"Access code please"},{"utterance":"How do I get my access code?"},{"utterance":"Get access code for booking {booking_reference_customer}"},{"utterance":"I need the access code for booking {booking_reference_customer}"},{"utterance":"{booking_reference_customer} access code"},{"utterance":"access code for {booking_reference_customer}"}]' \
        --slot-priorities priority=1,slotId=${self.triggers.slot_id} \
        --fulfillment-code-hook '{"enabled":true}'
    EOT
  }

  depends_on = [
    aws_lexv2models_intent.fetch_booking,
    aws_lexv2models_slot.booking_reference_booking,
    aws_lambda_function.bot_fetch_booking,
    aws_lexv2models_bot_locale.chatbot_locale,
  ]
}
