#!/bin/bash
# Script to install MySQL dependencies for Lambda layer

# Create the layer directory structure
mkdir -p /Users/vaibhav_patel/Documents/DalScooter/DalScooter/packages/mysql_layer/python

# Install PyMySQL and dependencies into the layer directory
python3 -m pip install PyMySQL==1.1.0 cryptography==41.0.7 -t /Users/vaibhav_patel/Documents/DalScooter/DalScooter/packages/mysql_layer/python/

echo "MySQL layer dependencies installed successfully"
