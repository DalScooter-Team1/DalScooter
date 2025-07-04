variable "verified_emails" {
  description = "List of email addresses to verify in SES (you’ll get a verification email for each)"
  type        = list(string)
  default     = [
    "example@test.com"
    #Remove above email and add here your emails that you want to get emails to from SES service
    #add emails as a list/array of string
  ]
}

resource "aws_ses_email_identity" "emails" {
  for_each = toset(var.verified_emails)
  email    = each.value
}

