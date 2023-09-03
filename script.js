const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const categoryInput = document.getElementById('categoryInput');
const priorityInput = document.getElementById('priorityInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterCompletionSelect = document.getElementById('filterCompletion');
const filterCategorySelect = document.getElementById('filterCategory');
const searchInput = document.getElementById('searchInput');
const taskCount = document.getElementById('taskCount');
const completedTaskCount = document.getElementById('completedTaskCount');

const tasks = [];

// Define a custom priority order function
function getPriorityOrder(priority) {
    const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
    return priorityOrder[priority] || 4; // Default to 4 for unknown priorities
}

function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks.length = 0;
        const parsedTasks = JSON.parse(savedTasks);
        tasks.push(...parsedTasks);
        sortTasksByStatusAndPriority();
        applyFilters();
    }
    updateTaskCounts();
}

function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.classList.add(task.status);
    taskItem.innerHTML = `
        <span class="task-text">${task.text}</span>
        <span class="due-date">Due: ${task.dueDate}</span>
        <span class="category">Category: ${task.category}</span>
        <span class="priority">Priority: ${task.priority}</span>
        <button class="complete-btn">Complete</button>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
    `;

    const deleteBtn = taskItem.querySelector('.delete-btn');
    const completeBtn = taskItem.querySelector('.complete-btn');
    const editBtn = taskItem.querySelector('.edit-btn');

    deleteBtn.addEventListener('click', () => {
        taskList.removeChild(taskItem);
        removeTaskFromArray(task);
        saveTasksToLocalStorage();
        updateTaskCounts();
    });

    completeBtn.addEventListener('click', () => {
        toggleTaskStatus(task);
        sortTasksByStatusAndPriority();
        saveTasksToLocalStorage();
        applyFilters();
        updateTaskCounts();
    });

    editBtn.addEventListener('click', () => {
        const taskText = taskItem.querySelector('.task-text');
        taskText.contentEditable = true;
        taskText.focus();

        taskText.addEventListener('blur', () => {
            taskText.contentEditable = false;
            task.text = taskText.textContent;
            saveTasksToLocalStorage();
        });
    });

    return taskItem;
}

function toggleTaskStatus(task) {
    task.status = task.status === 'incomplete' ? 'complete' : 'incomplete';
}

function sortTasksByStatusAndPriority() {
    tasks.sort((a, b) => {
        if (a.status === b.status) {
            const orderA = getPriorityOrder(a.priority);
            const orderB = getPriorityOrder(b.priority);
            return orderA - orderB;
        } else {
            return a.status === 'incomplete' ? -1 : 1;
        }
    });

    taskList.innerHTML = '';
    for (const task of tasks) {
        const taskItem = createTaskElement(task);
        taskList.appendChild(taskItem);
    }
}

function removeTaskFromArray(task) {
    const index = tasks.indexOf(task);
    if (index !== -1) {
        tasks.splice(index, 1);
    }
}

function updateTaskCounts() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'complete').length;

    taskCount.textContent = `Total Tasks: ${totalTasks}`;
    completedTaskCount.textContent = `Completed Tasks: ${completedTasks}`;
}

function applyFilters() {
    const filterCompletion = filterCompletionSelect.value;
    const filterCategory = filterCategorySelect.value;
    const searchQuery = searchInput.value.toLowerCase();

    const filteredTasks = tasks.filter((task) => {
        const taskText = task.text.toLowerCase();

        if (filterCompletion === 'all' && filterCategory === 'all') {
            return taskText.includes(searchQuery);
        }
        if (filterCompletion === 'all' && filterCategory !== 'all') {
            return task.category === filterCategory && taskText.includes(searchQuery);
        }
        if (filterCompletion !== 'all' && filterCategory === 'all') {
            return task.status === filterCompletion && taskText.includes(searchQuery);
        }
        return task.status === filterCompletion && task.category === filterCategory && taskText.includes(searchQuery);
    });

    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        const noResultsItem = document.createElement('div');
        noResultsItem.textContent = 'No matching tasks found.';
        taskList.appendChild(noResultsItem);
    } else {
        for (const task of filteredTasks) {
            const taskItem = createTaskElement(task);
            taskList.appendChild(taskItem);
        }
    }
}

loadTasksFromLocalStorage();

function addTask() {
    const taskText = taskInput.value;
    const dueDate = dueDateInput.value;
    const category = categoryInput.value;
    const priority = priorityInput.value;

    if (taskText.trim() !== '') {
        const task = {
            text: taskText,
            dueDate: dueDate,
            category: category,
            priority: priority,
            status: 'incomplete'
        };

        tasks.push(task);
        sortTasksByStatusAndPriority();
        saveTasksToLocalStorage();
        applyFilters();
        updateTaskCounts();

        taskInput.value = '';
        dueDateInput.value = '';
    }
}

addTaskBtn.addEventListener('click', addTask);
filterCompletionSelect.addEventListener('change', applyFilters);
filterCategorySelect.addEventListener('change', applyFilters);
searchInput.addEventListener('input', applyFilters);
