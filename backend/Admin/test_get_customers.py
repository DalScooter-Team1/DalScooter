#!/usr/bin/env python3
"""
Test script for the Get Customers API endpoint
This script demonstrates how to call the endpoint with proper authentication
"""

import requests
import json
import os
from typing import Optional

class DalScooterAPI:
    def __init__(self, api_base_url: str, jwt_token: str):
        """
        Initialize the API client
        
        Args:
            api_base_url: Base URL of the API Gateway (e.g., https://xxx.execute-api.region.amazonaws.com/prod)
            jwt_token: JWT token for authentication
        """
        self.api_base_url = api_base_url.rstrip('/')
        self.jwt_token = jwt_token
        self.headers = {
            'Authorization': f'Bearer {jwt_token}',
            'Content-Type': 'application/json'
        }
    
    def get_customers(self, limit: Optional[int] = None, 
                     pagination_token: Optional[str] = None,
                     group: Optional[str] = None) -> dict:
        """
        Get list of customers from the API
        
        Args:
            limit: Number of users to return (max 60)
            pagination_token: Token for pagination
            group: Filter by group ('customers', 'franchise', 'all')
            
        Returns:
            API response as dictionary
        """
        url = f"{self.api_base_url}/customers"
        params = {}
        
        if limit is not None:
            params['limit'] = limit
        if pagination_token:
            params['paginationToken'] = pagination_token
        if group:
            params['group'] = group
            
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error making request: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response content: {e.response.text}")
            raise

def main():
    """
    Main function to test the API endpoint
    """
    # Configuration - replace with your actual values
    API_BASE_URL = os.getenv('DALSCOOTER_API_URL', 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod')
    JWT_TOKEN = os.getenv('DALSCOOTER_JWT_TOKEN', 'your-jwt-token-here')
    
    if JWT_TOKEN == 'your-jwt-token-here':
        print("Please set the DALSCOOTER_JWT_TOKEN environment variable with a valid JWT token")
        print("You can get a JWT token by logging in as an admin user through the DalScooter application")
        return
    
    if API_BASE_URL == 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod':
        print("Please set the DALSCOOTER_API_URL environment variable with your actual API Gateway URL")
        return
    
    # Initialize API client
    api = DalScooterAPI(API_BASE_URL, JWT_TOKEN)
    
    print("Testing DalScooter Get Customers API...")
    print(f"API URL: {API_BASE_URL}")
    print("-" * 50)
    
    try:
        # Test 1: Get all customers (default)
        print("Test 1: Getting all customers (default)")
        result = api.get_customers()
        print(f"Success: {result['success']}")
        print(f"Total customers: {result['totalCount']}")
        print(f"Returned {len(result['users'])} users")
        if result['users']:
            print(f"First user: {result['users'][0]['email']} ({result['users'][0]['firstName']} {result['users'][0]['lastName']})")
        print()
        
        # Test 2: Get customers with limit
        print("Test 2: Getting customers with limit of 5")
        result = api.get_customers(limit=5)
        print(f"Success: {result['success']}")
        print(f"Returned {len(result['users'])} users")
        print()
        
        # Test 3: Get all users (customers and franchise)
        print("Test 3: Getting all users (customers and franchise)")
        result = api.get_customers(group='all')
        print(f"Success: {result['success']}")
        print(f"Total users: {result['totalCount']}")
        for user in result['users']:
            groups = ', '.join(user.get('groups', []))
            print(f"  - {user['email']} (Groups: {groups})")
        print()
        
        # Test 4: Get only franchise users
        print("Test 4: Getting only franchise users")
        result = api.get_customers(group='franchise')
        print(f"Success: {result['success']}")
        print(f"Total franchise users: {result['totalCount']}")
        for user in result['users']:
            groups = ', '.join(user.get('groups', []))
            print(f"  - {user['email']} (Groups: {groups})")
        
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == "__main__":
    main()
