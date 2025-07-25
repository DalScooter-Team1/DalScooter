# resource "aws_lexv2models_intent" "fallback_intent" {
#   bot_id                   = var.bot_id
#   bot_version              = "DRAFT"
#   locale_id                = var.locale_id
#   name                     = "FallbackIntent"
#   description              = "Handles unrecognized user input"
#   parent_intent_signature  = "AMAZON.FallbackIntent"

#   initial_response_setting {
#     initial_response {
#       message_group {
#         message {
#           plain_text_message {
#             value = "Sorry, I didn't understand that. Could you please rephrase your request?"
#           }
#         }
#       }
#     }
#   }
# }