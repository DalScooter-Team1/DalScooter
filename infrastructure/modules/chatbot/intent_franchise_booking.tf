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

  depends_on = [ aws_lexv2models_intent.franchise_booking ]
}

############################
# Patch Intent via AWS CLI
# (adds the slot‑placeholder utterances,
#  sets slot priority, and hooks Lambda)
############################
resource "null_resource" "patch_franchise_booking_intent" {
  triggers = {
    bot_id     = aws_lexv2models_bot.chatbot.id
    locale_id  = var.locale_id
    intent_id  = aws_lexv2models_intent.franchise_booking.intent_id
    slot_id    = aws_lexv2models_slot.booking_reference_bike.slot_id
  }

  provisioner "local-exec" {
    interpreter = ["bash", "-c"]
    command = <<-EOT
      aws lexv2-models update-intent \
        --bot-id ${self.triggers.bot_id} \
        --bot-version DRAFT \
        --locale-id ${self.triggers.locale_id} \
        --intent-id ${self.triggers.intent_id} \
        --intent-name franchise_booking_intent \
        --sample-utterances '[{"utterance":"{booking_reference_franchise} bike number"},{"utterance":"Bike number for {booking_reference_franchise}"},{"utterance":"Get bike for {booking_reference_franchise}"},{"utterance":"Which bike {booking_reference_franchise}"},{"utterance":"Booking {booking_reference_franchise} bike"},{"utterance":"Show bike {booking_reference_franchise}"},{"utterance":"Bike ID {booking_reference_franchise}"},{"utterance":"Tell bike {booking_reference_franchise}"},{"utterance":"Give me bike number"},{"utterance":"Bike number please"},{"utterance":"Get bike number"}]' \
        --slot-priorities priority=1,slotId=${self.triggers.slot_id} \
        --fulfillment-code-hook '{"enabled":true}'
    EOT
  }

  depends_on = [
    aws_lexv2models_intent.franchise_booking,
    aws_lexv2models_slot.booking_reference_bike,
    aws_lambda_function.bot_fetch_booking,
    aws_lexv2models_bot_locale.chatbot_locale,
  ]
}
