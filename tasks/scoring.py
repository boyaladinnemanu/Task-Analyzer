from datetime import date, datetime, timedelta
from django.utils import timezone
from .models import Task

def calculate_task_score(task_data):
    """
    Calculate a priority score for a task based on various factors.
    Higher score means higher priority.
    
    Args:
        task_data (dict): Dictionary containing task information
            - due_date (date): Due date of the task
            - importance (int): Importance level (1-10)
            - estimated_hours (int): Estimated hours to complete
            - dependencies (list): List of task IDs this task depends on
            - completed (bool): Whether the task is completed
    
    Returns:
        dict: Task data with an added 'score' field
    """
    if task_data.get('completed', False):
        task_data['score'] = -1  # Lowest priority for completed tasks
        return task_data
    
    score = 0
    today = timezone.now().date()
    
    # 1. Importance (40% weight)
    importance = task_data.get('importance', 5)
    score += importance * 4  # Scale importance to have more impact
    
    # 2. Urgency (40% weight)
    due_date = task_data.get('due_date')
    if due_date:
        if isinstance(due_date, str):
            due_date = datetime.strptime(due_date, '%Y-%m-%d').date()
            
        days_until_due = (due_date - today).days
        
        if days_until_due < 0:
            # Overdue tasks get a high priority boost
            score += 100 + abs(days_until_due) * 2
        elif days_until_due == 0:
            score += 80  # Due today
        elif days_until_due <= 3:
            score += 60  # Due in 1-3 days
        elif days_until_due <= 7:
            score += 40  # Due in 4-7 days
        elif days_until_due <= 14:
            score += 20  # Due in 1-2 weeks
    
    # 3. Effort (10% weight) - Quick wins get a small boost
    estimated_hours = task_data.get('estimated_hours', 1)
    if estimated_hours <= 1:
        score += 15  # Quick task bonus
    elif estimated_hours <= 4:
        score += 5   # Medium task small bonus
    
    # 4. Dependencies (10% weight)
    dependencies = task_data.get('dependencies', [])
    if dependencies:
        # If this task has dependencies, it should be a lower priority
        score -= len(dependencies) * 5
    
    task_data['score'] = max(0, score)  # Ensure score is not negative
    return task_data

def prioritize_tasks(tasks):
    """
    Prioritize a list of tasks based on their scores.
    
    Args:
        tasks (list): List of task dictionaries
        
    Returns:
        list: Sorted list of tasks with scores, highest priority first
    """
    # Calculate scores for all tasks
    scored_tasks = [calculate_task_score(task) for task in tasks]
    
    # Sort by score (descending) and then by due date (ascending)
    return sorted(
        scored_tasks,
        key=lambda x: (-x['score'], 
                      x.get('due_date', '9999-12-31') if x.get('due_date') else '9999-12-31')
    )
