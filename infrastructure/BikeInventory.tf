# ================================
# BIKE INVENTORY INFRASTRUCTURE
# ================================
# This file contains all resources related to bike inventory management
# including bikes, discount codes, and related operations

# ================================
# DYNAMODB TABLES
# ================================

# Bikes Table - Stores bike information and features
resource "aws_dynamodb_table" "bikes" {
  name         = "dalscooter-bikes"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "bikeId"

  attribute {
    name = "bikeId"
    type = "S"
  }

  attribute {
    name = "bikeType"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "franchiseId"
    type = "S"
  }

  # Global Secondary Index for querying by bike type
  global_secondary_index {
    name            = "bikeType-index"
    hash_key        = "bikeType"
    projection_type = "ALL"
  }

  # Global Secondary Index for querying by status
  global_secondary_index {
    name            = "status-index"
    hash_key        = "status"
    projection_type = "ALL"
  }

  # Global Secondary Index for querying by franchise
  global_secondary_index {
    name            = "franchiseId-index"
    hash_key        = "franchiseId"
    projection_type = "ALL"
  }

  tags = {
    Name    = "DALScooter Bikes"
    Project = "DALScooter"
  }
}

# Discount Codes Table - Stores discount codes and their properties
resource "aws_dynamodb_table" "discount_codes" {
  name         = "dalscooter-discount-codes"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "codeId"

  attribute {
    name = "codeId"
    type = "S"
  }

  attribute {
    name = "code"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "expiryDate"
    type = "S"
  }

  # Global Secondary Index for querying by code
  global_secondary_index {
    name            = "code-index"
    hash_key        = "code"
    projection_type = "ALL"
  }

  # Global Secondary Index for querying by status
  global_secondary_index {
    name            = "status-index"
    hash_key        = "status"
    projection_type = "ALL"
  }

  # Global Secondary Index for querying by expiry date
  global_secondary_index {
    name            = "expiryDate-index"
    hash_key        = "expiryDate"
    projection_type = "ALL"
  }

  # Enable TTL on the expiryTimestamp attribute
  ttl {
    attribute_name = "expiryTimestamp"
    enabled        = true
  }

  tags = {
    Name    = "DALScooter Discount Codes"
    Project = "DALScooter"
  }
}

# User Discount Usage Table - Tracks which users have used which discount codes
resource "aws_dynamodb_table" "user_discount_usage" {
  name         = "dalscooter-user-discount-usage"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "codeId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "codeId"
    type = "S"
  }

  attribute {
    name = "usedDate"
    type = "S"
  }

  # Global Secondary Index for querying by code usage
  global_secondary_index {
    name            = "codeId-usedDate-index"
    hash_key        = "codeId"
    range_key       = "usedDate"
    projection_type = "ALL"
  }

  tags = {
    Name    = "DALScooter User Discount Usage"
    Project = "DALScooter"
  }
}



# ================================
# OUTPUT VALUES
# ================================

output "bikes_table_name" {
  description = "Name of the bikes DynamoDB table"
  value       = aws_dynamodb_table.bikes.name
}

output "bikes_table_arn" {
  description = "ARN of the bikes DynamoDB table"
  value       = aws_dynamodb_table.bikes.arn
}

output "discount_codes_table_name" {
  description = "Name of the discount codes DynamoDB table"
  value       = aws_dynamodb_table.discount_codes.name
}

output "discount_codes_table_arn" {
  description = "ARN of the discount codes DynamoDB table"
  value       = aws_dynamodb_table.discount_codes.arn
}

output "user_discount_usage_table_name" {
  description = "Name of the user discount usage DynamoDB table"
  value       = aws_dynamodb_table.user_discount_usage.name
}

output "user_discount_usage_table_arn" {
  description = "ARN of the user discount usage DynamoDB table"
  value       = aws_dynamodb_table.user_discount_usage.arn
}
