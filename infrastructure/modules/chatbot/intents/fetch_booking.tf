resource "aws_lexv2models_intent" "fetch_booking" {
  locale_id   = var.locale_id
  bot_id      = var.bot_id
  bot_version = "DRAFT"
  name        = "fetch_booking_intent"
  description = "This intent will fetch the booking details for the user based on the booking reference number provided by the user."

  sample_utterance {
    utterance = "What is my booking status?"
  }
  sample_utterance {
    utterance = "Can you tell me about my booking?"
  }
  sample_utterance {
    utterance = "I want to check my booking details"
  }
  sample_utterance {
    utterance = "Show me my booking information"
  }
  sample_utterance {
    utterance = "I need to know my booking status"
  }
  sample_utterance {
    utterance = "What is the status of my booking?"
  }
  sample_utterance {
    utterance = "Can you provide my booking details?"
  }
  sample_utterance {
    utterance = "I want to see my booking status"
  }
  sample_utterance {
    utterance = "Tell me about my booking"
  }
  sample_utterance {
    utterance = "I want to check my booking"
  }



  initial_response_setting {
    initial_response {
      message_group {
        message {
          plain_text_message {
            value = "To fetch your booking details, I will need your booking reference number. Please provide it."
          }
        }
      }
    }
  }

   
 
}

resource "aws_lexv2models_slot" "reference_number" {
  bot_id        = var.bot_id
  bot_version   = "DRAFT"
  intent_id     = aws_lexv2models_intent.fetch_booking.intent_id
  locale_id     = var.locale_id
  name          = "booking_reference_number"
  description   = "Slot to capture the booking reference number"
  slot_type_id  = "AMAZON.AlphaNumeric"
  depends_on = [ aws_lexv2models_intent.fetch_booking ]

  value_elicitation_setting {
    slot_constraint = "Required"
    prompt_specification {
      allow_interrupt            = true
      max_retries                = 1
      message_selection_strategy = "Random"

      #This will be the prompt that will be shown to the user when the bot asks for the booking reference number
      message_group {
        message {
          plain_text_message {
            value = "Please provide your Alphanumeric booking reference number."
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
  #To do: add other case responses
  #To do: Refine the slot types
}

#We did not specify the slot priority in the first place
#Now we will try to update the slot priority

resource "null_resource" "update_intent_with_slot_priority" {
  triggers = {
    intent_id = aws_lexv2models_intent.fetch_booking.intent_id
    slot_id   = aws_lexv2models_slot.reference_number.slot_id
  }

  #This is a amazon comman line script to update the intent with the slot priority
  #This will be executed only when the intent or slot is created or updated
  provisioner "local-exec" {
    command = <<EOT
      aws lexv2-models update-intent \
        --intent-id ${aws_lexv2models_intent.fetch_booking.intent_id} \
        --intent-name fetch_booking_intent \
        --bot-id ${var.bot_id} \
        --bot-version DRAFT \
        --locale-id ${var.locale_id} \
        --slot-priorities priority=1,slotId=${aws_lexv2models_slot.reference_number.slot_id}
    EOT
  }

  depends_on = [
    aws_lexv2models_intent.fetch_booking,
    aws_lexv2models_slot.reference_number
  ]
}



