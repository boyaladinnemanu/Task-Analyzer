from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
import json
from datetime import date, timedelta

class TaskAnalysisTests(APITestCase):
    def test_analyze_tasks(self):
        """Test task analysis endpoint with sample tasks"""
        url = reverse('analyze_tasks')
        
        # Sample tasks data
        tasks = [
            {
                "title": "Complete project",
                "due_date": str(date.today() + timedelta(days=1)),
                "importance": 8,
                "estimated_hours": 4,
                "dependencies": []
            },
            {
                "title": "Review code",
                "due_date": str(date.today() + timedelta(days=3)),
                "importance": 5,
                "estimated_hours": 2,
                "dependencies": [0]
            }
        ]
        
        # Test with valid data
        response = self.client.post(
            url, 
            data=json.dumps({"tasks": tasks}), 
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tasks', response.data)
        self.assertEqual(len(response.data['tasks']), 2)
        
        # Test with invalid data
        response = self.client.post(
            url,
            data='invalid json',
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_suggest_tasks(self):
        """Test task suggestion endpoint"""
        url = reverse('suggest_tasks')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('suggested_tasks', response.data)
