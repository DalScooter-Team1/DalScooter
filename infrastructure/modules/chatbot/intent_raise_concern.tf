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

  depends_on = [ aws_lexv2models_intent.raise_concern ]
}

############################
# Patch Intent via AWS CLI
# (adds the slot‑placeholder utterances,
#  sets slot priority, and hooks Lambda)
############################
resource "null_resource" "patch_raise_concern_intent" {
  triggers = {
    bot_id     = aws_lexv2models_bot.chatbot.id
    locale_id  = var.locale_id
    intent_id  = aws_lexv2models_intent.raise_concern.intent_id
    slot_id    = aws_lexv2models_slot.booking_reference_concern.slot_id
  }

  provisioner "local-exec" {
    interpreter = ["bash", "-c"]
    command = <<-EOT
      aws lexv2-models update-intent \
        --bot-id ${self.triggers.bot_id} \
        --bot-version DRAFT \
        --locale-id ${self.triggers.locale_id} \
        --intent-id ${self.triggers.intent_id} \
        --intent-name raise_concern_intent \
        --sample-utterances '[{"utterance":"I have an issue"},{"utterance":"Raise a concern"},{"utterance":"Report a problem"},{"utterance":"I want to raise a concern"},{"utterance":"raise a ticket"},{"utterance":"Report an issue"},{"utterance":"I have an issue with booking {booking_reference_concern}"},{"utterance":"Raise a concern for booking {booking_reference_concern}"},{"utterance":"Report a problem with booking {booking_reference_concern}"},{"utterance":"issue for {booking_reference_concern}"},{"utterance":"concern for {booking_reference_concern}"}]' \
        --slot-priorities priority=1,slotId=${self.triggers.slot_id} \
        --fulfillment-code-hook '{"enabled":true}'
    EOT
  }

  depends_on = [
    aws_lexv2models_intent.raise_concern,
    aws_lexv2models_slot.booking_reference_concern,
    aws_lambda_function.bot_fetch_booking,
    aws_lexv2models_bot_locale.chatbot_locale,
  ]
}
