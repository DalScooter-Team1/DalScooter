module "intents"{
    source = "./intents"

    #Bot related variables
    bot_id = aws_lexv2models_bot.dalscooter_chatbot.id
    bot_version = "DRAFT"
    locale_id = aws_lexv2models_bot_locale.dalscooter_chatbot_locale.locale_id
    
}