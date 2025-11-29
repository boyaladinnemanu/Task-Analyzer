document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskForm = document.querySelector('.task-input');
    const taskList = document.getElementById('tasks');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const loadJsonBtn = document.getElementById('loadJsonBtn');
    const jsonInput = document.getElementById('jsonInput');
    const priorityResults = document.getElementById('priorityResults');
    const suggestedTasks = document.getElementById('suggestedTasks');
    
    // Task array to store all tasks
    let tasks = [];
    
    // Initialize the application
    function init() {
        loadTasks();
        setupEventListeners();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Handle form submission (when clicking Add Task or pressing Enter)
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addTaskFromForm();
        });
        
        // Clear form button
        document.getElementById('clearForm').addEventListener('click', function(e) {
            e.preventDefault();
            taskForm.reset();
            console.log('Form cleared');
        });
        
        // Analyze tasks button
        analyzeBtn.addEventListener('click', analyzeTasks);
        
        // Clear all tasks button
        clearBtn.addEventListener('click', clearAllTasks);
        
        // Load tasks from JSON button
        loadJsonBtn.addEventListener('click', loadTasksFromJson);
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dueDate').min = today;
        
        // Log when event listeners are set up
        console.log('Event listeners set up successfully');
    }
    
    // Add a new task from the form
    function addTaskFromForm() {
        console.log('addTaskFromForm called');
        const title = document.getElementById('taskTitle').value.trim();
        const dueDate = document.getElementById('dueDate').value;
        const importance = parseInt(document.getElementById('importance').value) || 5;
        const effort = parseInt(document.getElementById('effort').value) || 1;
        
        console.log('Form values:', { title, dueDate, importance, effort });
        
        if (!title || !dueDate) {
            console.error('Title and due date are required');
            alert('Please fill in all required fields');
            return;
        }
        
        const newTask = {
            id: Date.now(),
            title: title,
            due_date: dueDate,
            importance: importance || 5,
            estimated_hours: effort || 1,
            dependencies: [],
            completed: false
        };
        
        addTask(newTask);
        taskForm.reset();
    }
    
    // Add a task to the list and update UI
    function addTask(task) {
        tasks.push(task);
        saveTasks();
        renderTaskList();
        
        // Clear the form after adding a task
        taskForm.reset();
        console.log('Task added:', task);
    }
    
    // Render the task list
    function renderTaskList() {
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<p class="placeholder">No tasks added yet. Add a task to get started.</p>';
            return;
        }
        
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }
    
    // Create a task element
    function createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item ${task.completed ? 'completed' : ''} ${isOverdue(task.due_date) ? 'overdue' : ''}`;
        taskEl.dataset.id = task.id;
        
        const dueDate = new Date(task.due_date).toLocaleDateString();
        const daysLeft = getDaysUntilDue(task.due_date);
        let dueText = '';
        
        if (daysLeft < 0) {
            dueText = `Overdue by ${Math.abs(daysLeft)} days`;
        } else if (daysLeft === 0) {
            dueText = 'Due today';
        } else if (daysLeft === 1) {
            dueText = 'Due tomorrow';
        } else {
            dueText = `Due in ${daysLeft} days`;
        }
        
        taskEl.innerHTML = `
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span>${dueText}</span>
                    <span>Importance: ${task.importance}/10</span>
                    <span>Effort: ${task.estimated_hours} ${task.estimated_hours === 1 ? 'hour' : 'hours'}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon toggle-complete" title="Toggle Complete">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-icon delete-task" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners for the buttons
        const toggleBtn = taskEl.querySelector('.toggle-complete');
        const deleteBtn = taskEl.querySelector('.delete-task');
        
        toggleBtn.addEventListener('click', () => toggleTaskComplete(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        return taskEl;
    }
    
    // Toggle task completion status
    function toggleTaskComplete(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTaskList();
    }
    
    // Delete a task
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTaskList();
        }
    }
    
    // Clear all tasks
    function clearAllTasks() {
        if (tasks.length === 0) return;
        
        if (confirm('Are you sure you want to delete all tasks?')) {
            tasks = [];
            saveTasks();
            renderTaskList();
            clearResults();
        }
    }
    
    // Load tasks from JSON input
    function loadTasksFromJson() {
        try {
            const jsonTasks = JSON.parse(jsonInput.value);
            
            if (!Array.isArray(jsonTasks)) {
                throw new Error('Invalid JSON format. Expected an array of tasks.');
            }
            
            // Validate each task
            const validTasks = jsonTasks.map((task, index) => {
                if (!task.title || !task.due_date) {
                    throw new Error(`Task at index ${index} is missing required fields (title, due_date)`);
                }
                
                return {
                    id: task.id || Date.now() + index,
                    title: task.title,
                    due_date: task.due_date,
                    importance: parseInt(task.importance) || 5,
                    estimated_hours: parseInt(task.estimated_hours) || 1,
                    dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
                    completed: !!task.completed
                };
            });
            
            tasks = validTasks;
            saveTasks();
            renderTaskList();
            
            // Auto-analyze after loading
            analyzeTasks();
            
        } catch (error) {
            alert(`Error parsing JSON: ${error.message}`);
            console.error('JSON Parse Error:', error);
        }
    }
    
    // Analyze tasks using the API
    async function analyzeTasks() {
        if (tasks.length === 0) {
            alert('Please add some tasks first!');
            return;
        }
        
        // Prepare tasks for API
        const tasksForApi = tasks.map(task => ({
            id: task.id,
            title: task.title,
            due_date: task.due_date,
            importance: task.importance,
            estimated_hours: task.estimated_hours,
            dependencies: task.dependencies,
            completed: task.completed
        }));
        
        try {
            const response = await fetch('/api/analyze/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                },
                body: JSON.stringify(tasksForApi)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze tasks');
            }
            
            const data = await response.json();
            displayResults(data.tasks, data.suggested_tasks);
            
        } catch (error) {
            console.error('Error analyzing tasks:', error);
            alert(`Error: ${error.message}`);
        }
    }
    
    // Display analysis results
    function displayResults(prioritizedTasks, suggestedTasksList) {
        // Display prioritized tasks
        if (prioritizedTasks && prioritizedTasks.length > 0) {
            priorityResults.innerHTML = '';
            
            prioritizedTasks.forEach((task, index) => {
                if (task.completed) return; // Skip completed tasks in results
                
                const priorityClass = getPriorityClass(task.score);
                const dueDate = new Date(task.due_date).toLocaleDateString();
                
                const taskEl = document.createElement('div');
                taskEl.className = `priority-item ${priorityClass}`;
                taskEl.innerHTML = `
                    <div class="task-info">
                        <div class="task-title">${index + 1}. ${task.title}</div>
                        <div class="task-meta">
                            <span>Due: ${dueDate}</span>
                            <span>Importance: ${task.importance}/10</span>
                            <span>Effort: ${task.estimated_hours} ${task.estimated_hours === 1 ? 'hour' : 'hours'}</span>
                        </div>
                    </div>
                    <div class="priority-score">Score: ${Math.round(task.score)}</div>
                `;
                
                priorityResults.appendChild(taskEl);
            });
        } else {
            priorityResults.innerHTML = '<p class="placeholder">No tasks to display. Add some tasks and analyze them.</p>';
        }
        
        // Display suggested tasks
        if (suggestedTasksList && suggestedTasksList.length > 0) {
            suggestedTasks.innerHTML = '';
            
            suggestedTasksList.forEach((task, index) => {
                const taskEl = document.createElement('div');
                taskEl.className = 'task-item';
                
                const dueDate = new Date(task.due_date).toLocaleDateString();
                
                taskEl.innerHTML = `
                    <div class="task-info">
                        <div class="task-title">${task.title}</div>
                        <div class="task-meta">
                            <span>Due: ${dueDate}</span>
                            <span>Importance: ${task.importance}/10</span>
                            <span>Effort: ${task.estimated_hours} ${task.estimated_hours === 1 ? 'hour' : 'hours'}</span>
                        </div>
                    </div>
                `;
                
                suggestedTasks.appendChild(taskEl);
            });
        } else {
            suggestedTasks.innerHTML = '<p class="placeholder">No suggested tasks. Complete some tasks or add more tasks.</p>';
        }
    }
    
    // Clear all results
    function clearResults() {
        priorityResults.innerHTML = '<p class="placeholder">Your prioritized tasks will appear here after analysis.</p>';
        suggestedTasks.innerHTML = '<p class="placeholder">Your suggested tasks will appear here.</p>';
    }
    
    // Helper function to get priority class based on score
    function getPriorityClass(score) {
        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }
    
    // Helper function to check if a date is overdue
    function isOverdue(dueDate) {
        if (!dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(dueDate) < today;
    }
    
    // Helper function to get days until due
    function getDaysUntilDue(dueDate) {
        if (!dueDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        const diffTime = due - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('smartTaskAnalyzer_tasks', JSON.stringify(tasks));
    }
    
    // Load tasks from localStorage
    function loadTasks() {
        const savedTasks = localStorage.getItem('smartTaskAnalyzer_tasks');
        if (savedTasks) {
            try {
                tasks = JSON.parse(savedTasks);
                renderTaskList();
            } catch (error) {
                console.error('Error loading tasks:', error);
            }
        }
    }
    
    // Get CSRF token for Django
    function getCsrfToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }
    
    // Initialize the app
    init();
});
