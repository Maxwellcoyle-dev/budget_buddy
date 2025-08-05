#!/usr/bin/env python3
"""
Minimal test script for the PDF processor Lambda function
"""

import json
from app import lambda_handler

# Test event
test_event = {
    "test": "data",
    "message": "Hello from test"
}

# Test context
class TestContext:
    def __init__(self):
        self.function_name = "test-pdf-processor"

def test_minimal_function():
    """Test the minimal lambda_handler function"""
    print("Testing minimal PDF processor Lambda function...")
    
    try:
        # Test that the function can be imported
        print("✓ Function imported successfully")
        
        # Test that the function can be called
        context = TestContext()
        result = lambda_handler(test_event, context)
        
        print("✓ Function executed successfully")
        print(f"✓ Return value: {json.dumps(result, indent=2)}")
        
        return True
        
    except Exception as e:
        print(f"✗ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_minimal_function()
    if success:
        print("\n🎉 Minimal test passed!")
    else:
        print("\n❌ Minimal test failed!")
        exit(1) 