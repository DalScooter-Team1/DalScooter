# # ================================
# # RDS DATABASE INSTANCE
# # ================================
# # This file contains the RDS instance configuration for DalScooter

# # Data source to get available AZs
# data "aws_availability_zones" "available" {
#   state = "available"
# }

# # Create a DB subnet group
# resource "aws_db_subnet_group" "dalscooter_db_subnet_group" {
#   name       = "dalscooter-db-subnet-group"
#   subnet_ids = [aws_subnet.dalscooter_public_subnet_1.id, aws_subnet.dalscooter_public_subnet_2.id]

#   tags = {
#     Name    = "DalScooter DB subnet group"
#     Project = "DalScooter"
#   }
# }

# # Create VPC for RDS
# resource "aws_vpc" "dalscooter_vpc" {
#   cidr_block           = "10.0.0.0/16"
#   enable_dns_hostnames = true
#   enable_dns_support   = true

#   tags = {
#     Name    = "DalScooter VPC"
#     Project = "DalScooter"
#   }
# }

# # Create Internet Gateway
# resource "aws_internet_gateway" "dalscooter_igw" {
#   vpc_id = aws_vpc.dalscooter_vpc.id

#   tags = {
#     Name    = "DalScooter Internet Gateway"
#     Project = "DalScooter"
#   }
# }

# # Create public subnets
# resource "aws_subnet" "dalscooter_public_subnet_1" {
#   vpc_id                  = aws_vpc.dalscooter_vpc.id
#   cidr_block              = "10.0.1.0/24"
#   availability_zone       = data.aws_availability_zones.available.names[0]
#   map_public_ip_on_launch = true

#   tags = {
#     Name    = "DalScooter Public Subnet 1"
#     Project = "DalScooter"
#   }
# }

# resource "aws_subnet" "dalscooter_public_subnet_2" {
#   vpc_id                  = aws_vpc.dalscooter_vpc.id
#   cidr_block              = "10.0.2.0/24"
#   availability_zone       = data.aws_availability_zones.available.names[1]
#   map_public_ip_on_launch = true

#   tags = {
#     Name    = "DalScooter Public Subnet 2"
#     Project = "DalScooter"
#   }
# }

# # Create route table for public subnets
# resource "aws_route_table" "dalscooter_public_rt" {
#   vpc_id = aws_vpc.dalscooter_vpc.id

#   route {
#     cidr_block = "0.0.0.0/0"
#     gateway_id = aws_internet_gateway.dalscooter_igw.id
#   }

#   tags = {
#     Name    = "DalScooter Public Route Table"
#     Project = "DalScooter"
#   }
# }

# # Associate route table with public subnets
# resource "aws_route_table_association" "dalscooter_public_rta_1" {
#   subnet_id      = aws_subnet.dalscooter_public_subnet_1.id
#   route_table_id = aws_route_table.dalscooter_public_rt.id
# }

# resource "aws_route_table_association" "dalscooter_public_rta_2" {
#   subnet_id      = aws_subnet.dalscooter_public_subnet_2.id
#   route_table_id = aws_route_table.dalscooter_public_rt.id
# }

# # Create security group for RDS
# resource "aws_security_group" "dalscooter_rds_sg" {
#   name        = "dalscooter-rds-security-group"
#   description = "Security group for DalScooter RDS instance"
#   vpc_id      = aws_vpc.dalscooter_vpc.id

#   # Allow MySQL/Aurora access from anywhere (public access)
#   ingress {
#     from_port   = 3306
#     to_port     = 3306
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#     description = "MySQL access from anywhere"
#   }

#   # Allow PostgreSQL access from anywhere (if using PostgreSQL)
#   ingress {
#     from_port   = 5432
#     to_port     = 5432
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#     description = "PostgreSQL access from anywhere"
#   }

#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#     description = "All outbound traffic"
#   }

#   tags = {
#     Name    = "DalScooter RDS Security Group"
#     Project = "DalScooter"
#   }
# }

# # Create RDS instance
# resource "aws_db_instance" "dalscooter_rds" {
#   # Basic configuration
#   identifier     = "dalscooter-database"
#   engine         = var.rds_engine
#   engine_version = var.rds_engine_version
#   instance_class = var.rds_instance_class

#   # Database configuration
#   allocated_storage     = var.rds_allocated_storage
#   max_allocated_storage = var.rds_max_allocated_storage
#   storage_type          = "gp2"
#   storage_encrypted     = false

#   # Database credentials
#   db_name  = var.rds_database_name
#   username = var.rds_username
#   password = var.rds_password

#   # Network configuration
#   db_subnet_group_name   = aws_db_subnet_group.dalscooter_db_subnet_group.name
#   vpc_security_group_ids = [aws_security_group.dalscooter_rds_sg.id]
#   publicly_accessible    = true

#   # Optimized backup and maintenance for faster creation
#   backup_retention_period = 0 # Disable automated backups for faster creation
#   backup_window           = "03:00-04:00"
#   maintenance_window      = "sun:04:00-sun:05:00"

#   # Deletion protection and final snapshot
#   deletion_protection      = false
#   skip_final_snapshot      = true
#   delete_automated_backups = true

#   # Performance and monitoring - disabled for faster creation
#   performance_insights_enabled = false
#   monitoring_interval          = 0

#   # Speed up creation
#   apply_immediately = true

#   tags = {
#     Name    = "DalScooter RDS Instance"
#     Project = "DalScooter"
#   }
# }
