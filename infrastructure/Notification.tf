# ================================
# NOTIFICATION LAMBDA MOVED TO MODULE
# ================================
# The notification Lambda function and its associated resources have been moved 
# to the Lambda module for better organization:
#
# - notification_lambda_role (IAM role)
# - notification_lambda_policy (IAM policy)
# - notification_zip (archive file)
# - notification Lambda function
#
# These are now managed by the Lambda module at: modules/lambda/
# The Lambda module provides outputs that are used by Sns.tf

