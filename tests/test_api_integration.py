#!/usr/bin/env python3
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.apps.generation.services.api_client import AIClient

def test_apis():
    print("🧪 Testing Real API Integration...")
    print("=" * 50)
    
    # Test Gemini API
    print("Testing Gemini API...")
    try:
        gemini_client = AIClient('gemini-2.0-flash')
        messages = [gemini_client.format_message('user', 'Say exactly: Hello from Gemini!')]
        response = gemini_client.get_response(messages)
        print(f"✅ Gemini Response: {response}")
    except Exception as e:
        print(f"❌ Gemini Error: {e}")
    
    print()
    
    # Test GPT API
    print("Testing GPT API...")
    try:
        gpt_client = AIClient('gpt-3.5-turbo')
        messages = [gpt_client.format_message('user', 'Say exactly: Hello from GPT!')]
        response = gpt_client.get_response(messages)
        print(f"✅ GPT Response: {response}")
    except Exception as e:
        print(f"❌ GPT Error: {e}")

if __name__ == "__main__":
    test_apis() 