# resource "aws_lex_intent" "demo" {
#   name          = "OrderFlowers"
#   description   = "Intent to order flowers"
#   sample_utterances = [
#     "I want to order flowers",
#     "Order flowers for me",
#     "Can you help me order flowers?"
#   ]

#   fulfillment_activity {
#     type = "ReturnIntent"
#   }

#   conclusion_statement {
#     message {
#       content      = "Your order for flowers has been placed."
#       content_type = "PlainText"
#     }
#   }
# }
