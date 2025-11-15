#!/usr/bin/env python3
"""
Test script for the Event Task Generator API.
"""

import requests
import json

API_URL = "http://localhost:8000"


def test_health_check():
    """Test the health check endpoint."""
    print("Testing health check...")
    response = requests.get(f"{API_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")


def test_generate_tasks():
    """Test the task generation endpoint."""
    print("Testing task generation...")
    
    payload = {
        "event": "Product Launch",
        "event_info": "Launching a new mobile app in Q2 2024, targeting tech-savvy millennials. The app is a social networking platform for fitness enthusiasts."
    }
    
    response = requests.post(
        f"{API_URL}/generate-tasks",
        json=payload
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"\nEvent: {data['event']}")
        print(f"Total Tasks: {data['total_tasks']}\n")
        print("Tasks:")
        for i, task in enumerate(data['tasks'], 1):
            print(f"\n{i}. {task['task']}")
            print(f"   Priority: {task['priority']}")
            if task.get('estimated_time'):
                print(f"   Estimated Time: {task['estimated_time']}")
            if task.get('dependencies'):
                print(f"   Dependencies: {', '.join(task['dependencies'])}")
    else:
        print(f"Error: {response.text}\n")


def test_generate_tasks_wedding():
    """Test with a different event type."""
    print("Testing task generation for Wedding event...")
    
    payload = {
        "event": "Wedding",
        "event_info": "Outdoor wedding ceremony and reception for 150 guests in June 2024. Venue is a garden estate. Budget is $50,000."
    }
    
    response = requests.post(
        f"{API_URL}/generate-tasks",
        json=payload
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"\nEvent: {data['event']}")
        print(f"Total Tasks: {data['total_tasks']}\n")
        print("Tasks:")
        for i, task in enumerate(data['tasks'], 1):
            print(f"\n{i}. {task['task']}")
            print(f"   Priority: {task['priority']}")
            if task.get('estimated_time'):
                print(f"   Estimated Time: {task['estimated_time']}")
    else:
        print(f"Error: {response.text}\n")


if __name__ == "__main__":
    print("=" * 60)
    print("Event Task Generator API - Test Script")
    print("=" * 60)
    print("\nMake sure the API server is running:")
    print("  python api.py")
    print("  or")
    print("  uvicorn api:app --reload")
    print("\n" + "=" * 60 + "\n")
    
    try:
        test_health_check()
        test_generate_tasks()
        test_generate_tasks_wedding()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to API. Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"Error: {e}")

