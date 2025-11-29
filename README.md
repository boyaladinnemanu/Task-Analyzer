# Task Analyzer

A smart task management application that helps you prioritize your tasks based on importance, urgency, and effort required.


## Features

- **Task Prioritization**: Automatically sorts tasks based on importance, due date, and estimated effort
- **Smart Suggestions**: Get recommendations on which tasks to focus on next
- **Simple Interface**: Clean and intuitive user interface
- **Dependency Tracking**: Define task dependencies to ensure proper task ordering
- **Responsive Design**: Works on both desktop and mobile devices

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Django REST Framework
- **Database**: SQLite (default), can be configured to use PostgreSQL/MySQL
- **Deployment**: Can be deployed on any WSGI-compatible server (e.g., Gunicorn + Nginx)

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js (for frontend development, if needed)
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/task-analyzer.git
   cd task-analyzer
   ```

2. **Set up a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up the database**
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser (optional, for admin access)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   - Frontend: http://localhost:8000
   - Admin panel: http://localhost:8000/admin/

## API Endpoints

- `POST /api/analyze/` - Analyze and prioritize a list of tasks
- `GET /api/suggest/` - Get task suggestions

### Example Request

```json
POST /api/analyze/
Content-Type: application/json

[
  {
    "title": "Complete project documentation",
    "due_date": "2023-12-15",
    "importance": 8,
    "estimated_hours": 4,
    "dependencies": []
  },
  {
    "title": "Review pull requests",
    "due_date": "2023-12-10",
    "importance": 6,
    "estimated_hours": 2,
    "dependencies": [0]
  }
]
```

## Project Structure

```
task-analyzer/
├── backend/               # Django project settings
├── frontend/              # Frontend static files
│   ├── css/               # CSS styles
│   ├── js/                # JavaScript files
│   └── index.html         # Main HTML file
├── tasks/                 # Task management app
│   ├── migrations/        # Database migrations
│   ├── __init__.py
│   ├── admin.py          # Admin configuration
│   ├── apps.py           # App configuration
│   ├── models.py         # Database models
│   ├── scoring.py        # Task prioritization logic
│   ├── tests.py          # Test cases
│   ├── urls.py           # URL routing
│   └── views.py          # Request handlers
├── .gitignore
├── manage.py             # Django management script
├── README.md             # This file
└── requirements.txt      # Python dependencies
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## Acknowledgments

- Built with Django and vanilla JavaScript
- Inspired by various task management and productivity tools

---

Developed with ❤️ by Manoj
