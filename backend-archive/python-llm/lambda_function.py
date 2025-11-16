"""
AWS Lambda handler wrapper for the FastAPI application.
"""
from mangum import Mangum
from app.main import app

# Create Mangum handler for Lambda
handler = Mangum(app, lifespan="off")

def lambda_handler(event, context):
    """
    AWS Lambda handler function.
    
    Args:
        event: Lambda event object
        context: Lambda context object
    
    Returns:
        API Gateway response
    """
    return handler(event, context)

