#!/usr/bin/env python3
"""
Local test script for the PDF processor Lambda function
"""

import json
import os
from app import lambda_handler

# Set up test environment variables
os.environ['STATEMENTS_TABLE'] = 'test-statements-table'
os.environ['S3_BUCKET'] = 'test-statements-bucket'

# Test event (simulates S3 ObjectCreated event)
test_event = {
    "Records": [
        {
            "eventVersion": "2.1",
            "eventSource": "aws:s3",
            "awsRegion": "us-west-2",
            "eventTime": "2025-08-02T01:21:10.190Z",
            "eventName": "ObjectCreated:Put",
            "s3": {
                "s3SchemaVersion": "1.0",
                "configurationId": "test-config",
                "bucket": {
                    "name": "test-statements-bucket",
                    "ownerIdentity": {
                        "principalId": "test-owner"
                    },
                    "arn": "arn:aws:s3:::test-statements-bucket"
                },
                "object": {
                    "key": "statements/test-job-id/test-document.pdf",
                    "size": 1024,
                    "eTag": "test-etag",
                    "sequencer": "0A1B2C3D4E5F678901"
                }
            }
        }
    ]
}

# Test context (simulates Lambda context)
class TestContext:
    def __init__(self):
        self.function_name = "test-pdf-processor"
        self.function_version = "1"
        self.invoked_function_arn = "arn:aws:lambda:us-west-2:123456789012:function:test-pdf-processor"
        self.memory_limit_in_mb = 128
        self.remaining_time_in_millis = 30000
        self.aws_request_id = "test-request-id"

def test_lambda_function():
    """Test the lambda_handler function"""
    print("Testing PDF processor Lambda function...")
    
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
    success = test_lambda_function()
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n❌ Tests failed!")
        exit(1) 