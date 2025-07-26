resource "aws_lexv2models_bot" "dalscooter_chatbot" {
  name        = "DalAssistant"
  description = "Chatbot for DalScooter to assist users with various tasks"
  data_privacy {
    child_directed = false
  }
  idle_session_ttl_in_seconds = 60
  role_arn                    = aws_iam_role.dalscooter_chatbot_role.arn
  type                        = "Bot"

  tags = {
    Name    = "DALScooter Chatbot"
    Project = "DALScooter"
  }
  
   
}

resource "aws_iam_role" "dalscooter_chatbot_role" {
  name = "DALScooterChatbotRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lexv2.amazonaws.com"
        }
      },
    ]
  })

  tags = {
    created_by = "Terraform_dallscooter_chatbot"
  }
  
}