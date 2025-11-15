#!/usr/bin/env python3
"""
Simple Python app to connect with Google Gemini and get results.
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def initialize_gemini():
    """Initialize Gemini API with API key from environment variable."""
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY not found. Please set it in your .env file or environment variables."
        )
    
    genai.configure(api_key=api_key)
    return genai


def list_available_models():
    """List all available Gemini models."""
    try:
        models = genai.list_models()
        print("\nAvailable Gemini Models:")
        print("-" * 50)
        available_models = []
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                # Extract just the model name (e.g., "gemini-1.5-flash" from "models/gemini-1.5-flash")
                model_name = model.name.split('/')[-1] if '/' in model.name else model.name
                available_models.append(model_name)
                print(f"  - {model_name}")
        print()
        return available_models
    except Exception as e:
        print(f"Error listing models: {e}\n")
        return []


def get_gemini_response(prompt: str, model_name: str = "gemini-flash-latest") -> str:
    """
    Get response from Gemini AI model.
    
    Args:
        prompt: The input prompt/question for Gemini
        model_name: The Gemini model to use (default: "gemini-flash-latest")
    
    Returns:
        The response text from Gemini
    """
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"


def main():
    """Main function to run the app."""
    print("=" * 50)
    print("Gemini AI Connection App")
    print("=" * 50)
    
    try:
        # Initialize Gemini
        initialize_gemini()
        print("✓ Successfully connected to Gemini API\n")
        
        # List available models (optional, can be commented out)
        # list_available_models()
        
        # Example usage
        print("Commands: 'list-models' to see available models, 'quit' to exit\n")
        while True:
            user_input = input("Enter your prompt (or 'quit' to exit): ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("\nGoodbye!")
                break
            
            if user_input.lower() == 'list-models':
                list_available_models()
                continue
            
            if not user_input:
                print("Please enter a valid prompt.\n")
                continue
            
            print("\nProcessing...")
            response = get_gemini_response(user_input)
            
            if response.startswith("Error:"):
                print(f"\n{response}")
                print("\nTip: Try running 'list-models' to see available models.\n")
            else:
                print(f"\nGemini Response:\n{response}\n")
            
            print("-" * 50)
            print()
    
    except ValueError as e:
        print(f"Configuration Error: {e}")
        print("\nPlease create a .env file with your GEMINI_API_KEY")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()

