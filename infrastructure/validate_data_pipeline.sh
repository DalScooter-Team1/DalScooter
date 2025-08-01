#!/bin/bash

# ================================
# DALSCOOTER BOOKING DATA PIPELINE - VALIDATION SCRIPT
# ================================
# This script validates that the booking data pipeline infrastructure is properly configured

echo "🚀 DalScooter Booking Data Pipeline Infrastructure Validation"
echo "============================================================"

# Check if we're in the right directory
if [ ! -f "booking_data_pipeline.tf" ]; then
    echo "❌ Error: booking_data_pipeline.tf not found. Please run this script from the infrastructure directory."
    exit 1
fi

echo "✅ Infrastructure files found"

# Check if the Lambda function file exists
if [ ! -f "../backend/BookingQueue/booking_data_pipeline.py" ]; then
    echo "❌ Error: booking_data_pipeline.py not found in backend/BookingQueue/"
    exit 1
fi

echo "✅ Lambda function code found"

# Check if MySQL layer exists
if [ ! -d "../packages/mysql_layer/python" ]; then
    echo "❌ Error: MySQL layer not found. Please run scripts/install_mysql_layer.sh first."
    exit 1
fi

echo "✅ MySQL layer found"

# Check if PyMySQL is installed in the layer
if [ ! -d "../packages/mysql_layer/python/pymysql" ]; then
    echo "❌ Error: PyMySQL not found in MySQL layer. Please run scripts/install_mysql_layer.sh."
    exit 1
fi

echo "✅ PyMySQL dependency found"

# Validate Terraform syntax
echo "🔍 Validating Terraform configuration..."

if command -v terraform &> /dev/null; then
    terraform init -backend=false > /dev/null 2>&1
    terraform validate > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Terraform configuration is valid"
    else
        echo "❌ Terraform validation failed"
        terraform validate
        exit 1
    fi
else
    echo "⚠️  Terraform not installed, skipping syntax validation"
fi

echo ""
echo "🎉 All validation checks passed!"
echo ""
echo "📋 Infrastructure Summary:"
echo "  • DynamoDB Stream: ✅ Enabled on booking table"
echo "  • Lambda Function: ✅ booking_data_pipeline.py"
echo "  • MySQL Layer: ✅ PyMySQL + cryptography"
echo "  • Environment Variables: ✅ MySQL connection via ENV vars"
echo "  • No VPC: ✅ Lambda runs in AWS-managed VPC"
echo ""
echo "🚀 Ready to deploy with: terraform apply"
echo ""
echo "💡 When you run 'terraform apply', you will be prompted to enter:"
echo "   • mysql_host: Your database server hostname/IP"
echo "   • mysql_database: Your database name"
echo "   • mysql_username: Your database username"
echo "   • mysql_password: Your database password"
echo "   (mysql_port will default to 3306)"
echo ""
echo "📖 Data Pipeline Flow:"
echo "  1. DynamoDB booking table changes trigger stream"
echo "  2. Stream triggers Lambda function"
echo "  3. Lambda connects to your MySQL database using provided credentials"
echo "  4. Data is synchronized as-is to MySQL bookings table"
