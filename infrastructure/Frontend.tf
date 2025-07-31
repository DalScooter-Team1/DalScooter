 
resource "aws_amplify_app" "frontend" {
  name         = "DalScooterFrontend"
  repository = "git@github.com:DalScooter-Team1/DalScooter.git"

  access_token = var.github_access_token

  # Build settings
  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - nvm install 20
            - nvm use 20
            - node --version
            - npm --version
            - cd frontend
            - npm install

        build:
          commands:
            - npm ci
            - npm run build
      artifacts:
        baseDirectory: frontend/dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
  EOT

  # Enable automatic branch deployments
  enable_auto_branch_creation = true
  enable_branch_auto_build   = true
  enable_branch_auto_deletion = true


  # Environment variables
  environment_variables = {
    ENV = "production"
    VITE_SERVER = "${module.apis.api_gateway_invoke_url}"
    VITE_COGNITO_USER_POOL_ID = "${aws_cognito_user_pool.pool.id}"
    VITE_COGNITO_CLIENT_ID = "${aws_cognito_user_pool_client.client.id}"
  }
}

# Branch configuration for dev release
resource "aws_amplify_branch" "dev" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = "dev"

  framework = "React"
  stage     = "PRODUCTION"

  enable_auto_build = true
}

# Branch configuration for production release
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = "main"

  framework = "React"
  stage     = "PRODUCTION"

  enable_auto_build = true
}

# Define variables
variable "github_access_token" {
  description = "GitHub Access Token for Amplify"
  type        = string
  sensitive   = true
  default = " " # Replace with your actual token
}

# Output the Amplify app URL
output "Application_URL" {
  value = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.frontend.default_domain}"
}