# ================================
# LAMBDA MODULE - SHARED RESOURCES ONLY
# ================================
# This file contains only shared resources used by multiple Lambda functions.
# Individual Lambda function definitions are organized in separate files:
#
# - user_registration.tf: User registration Lambda and IAM resources
# - auth_challenge.tf: All auth challenge Lambda functions (define, create, verify)
# - admin_creation.tf: Admin creation Lambda and IAM resources
# - authenticators.tf: Customer and admin authenticator Lambda functions
# - notification.tf: Notification Lambda and IAM resources
#
# All Lambda functions share common dependencies defined below.

# ================================
# SHARED RESOURCES
# ================================

# Create a directory for the package if it doesn't exist
resource "local_file" "create_packages_dir" {
  content     = ""
  filename    = "${path.module}/../../packages/.keep"
  
  provisioner "local-exec" {
    command = "mkdir -p ${path.module}/../../packages"
  }
}
