from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.views.generic import TemplateView
from django.conf import settings
from .scoring import prioritize_tasks
import json
import os

class FrontendAppView(TemplateView):
    """Serves the compiled frontend entry point."""
    def get(self, request, path=''):
        # If the request is for a file that exists in the frontend directory, serve it
        if path and os.path.exists(os.path.join(settings.BASE_DIR, 'frontend', path)):
            try:
                with open(os.path.join(settings.BASE_DIR, 'frontend', path), 'rb') as f:
                    response = HttpResponse(f.read())
                    # Set content type based on file extension
                    if path.endswith('.css'):
                        response['Content-Type'] = 'text/css'
                    elif path.endswith('.js'):
                        response['Content-Type'] = 'application/javascript'
                    elif path.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
                        response['Content-Type'] = f'image/{path.split(".")[-1]}'
                    return response
            except Exception as e:
                return HttpResponse(f"Error loading file: {str(e)}", status=500)
        
        # Otherwise, serve the main index.html for client-side routing
        try:
            with open(os.path.join(settings.BASE_DIR, 'frontend', 'index.html'), 'r', encoding='utf-8') as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            return HttpResponse(
                """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Smart Task Analyzer</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            max-width: 800px; 
                            margin: 0 auto; 
                            padding: 20px; 
                            line-height: 1.6;
                        }
                        h1 { color: #4a6fa5; }
                        .error { color: #dc3545; }
                        code { 
                            background: #f5f5f5; 
                            padding: 2px 5px; 
                            border-radius: 3px; 
                            font-family: monospace;
                        }
                    </style>
                </head>
                <body>
                    <h1>Welcome to Smart Task Analyzer</h1>
                    <p class="error">Frontend files not found. Please make sure you've built the frontend.</p>
                    <p>If you're a developer, make sure to:</p>
                    <ol>
                        <li>Check that the <code>frontend</code> directory exists in the project root</li>
                        <li>Verify that <code>index.html</code> exists in the frontend directory</li>
                        <li>Run <code>python manage.py collectstatic</code> if needed</li>
                    </ol>
                </body>
                </html>
                """,
                status=501,
            )

@csrf_exempt
@require_http_methods(["POST"])
def analyze_tasks(request):
    """
    API endpoint to analyze and prioritize a list of tasks.
    
    Expected JSON input format:
    [
        {
            "id": 1,
            "title": "Task 1",
            "due_date": "2023-12-15",
            "importance": 8,
            "estimated_hours": 2,
            "dependencies": [],
            "completed": false
        },
        ...
    ]
    
    Returns:
        JSON response with sorted tasks including priority scores
    """
    try:
        # Parse the request body
        tasks = json.loads(request.body)
        
        if not isinstance(tasks, list):
            return JsonResponse(
                {"error": "Expected a list of tasks"}, 
                status=400
            )
        
        # Prioritize tasks
        prioritized_tasks = prioritize_tasks(tasks)
        
        # Get top 3 tasks for today
        top_tasks = [t for t in prioritized_tasks if not t.get('completed', False)][:3]
        
        return JsonResponse({
            "tasks": prioritized_tasks,
            "suggested_tasks": top_tasks,
            "message": "Tasks analyzed successfully"
        })
        
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON format"}, 
            status=400
        )
    except Exception as e:
        return JsonResponse(
            {"error": str(e)}, 
            status=500
        )

@require_http_methods(["GET"])
def suggest_tasks(request):
    """
    API endpoint to get task suggestions for today.
    This is a simplified version that expects tasks to be sent via query params.
    In a real app, you'd get this from the database.
    """
    try:
        # This is a simplified example - in a real app, you'd get tasks from the database
        # and pass them to prioritize_tasks()
        return JsonResponse({
            "suggested_tasks": [],
            "message": "Send a POST request to /api/analyze/ with your tasks for suggestions"
        })
    except Exception as e:
        return JsonResponse(
            {"error": str(e)}, 
            status=500
        )
