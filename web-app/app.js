// ===================== LOGIN =====================
function login() {
  const username = document.getElementById("username")?.value;
  const password = document.getElementById("password")?.value;
  const error = document.getElementById("error");

  if (error) error.innerText = "";

  if (!username || !password) {
    if (error) error.innerText = "Fill all fields";
    return;
  }

  fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      username: username,
      password: password
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Login:", data);

      if (data.message === "Logged in") {
        window.location.href = "dashboard.html";
      } else {
        if (error) error.innerText = data.message || "Login failed";
      }
    })
    .catch(err => {
      console.error(err);
      if (error) error.innerText = "Server error";
    });
}


// ===================== REGISTER =====================
function registerUser(event) {
  if (event) event.preventDefault();

  const username = document.getElementById("registerUsername")?.value;
  const password = document.getElementById("registerPassword")?.value;
  const message = document.getElementById("registerMessage");

  if (message) message.innerText = "";

  if (!username || !password) {
    if (message) {
      message.style.color = "red";
      message.innerText = "Username and password required";
    }
    return;
  }

  fetch("http://127.0.0.1:5000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Register:", data);

      if (message) {
        if (data.message === "User created") {
          message.style.color = "green";
          message.innerText = "Account created. Redirecting to login...";
        } else {
          message.style.color = "red";
          message.innerText = data.message || "Could not create account";
        }
      }

      if (data.message === "User created") {
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1200);
      }
    })
    .catch(err => {
      console.error(err);
      if (message) {
        message.style.color = "red";
        message.innerText = "Error creating account";
      }
    });
}


// ===================== LOGOUT =====================
function logout() {
  fetch("http://127.0.0.1:5000/logout", {
    method: "GET",
    credentials: "include"
  })
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(err => {
      console.error(err);
    });
}


// ===================== LOAD TASKS =====================
function loadTasks() {
  fetch("http://127.0.0.1:5000/tasks", {
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to load tasks");
      }
      return res.json();
    })
    .then(data => {
      console.log("Tasks:", data);

      const tableBody = document.getElementById("taskTableBody");
      if (!tableBody) return;

      tableBody.innerHTML = "";

      if (data.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5">No tasks yet</td>`;
        tableBody.appendChild(row);
        return;
      }

      data.forEach(task => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${task.title}</td>
          <td>${task.class || "No class"}</td>
          <td>${task.due_date || "No due date"}</td>
          <td>${task.priority || "Medium"}</td>
          <td><button type="button" onclick="deleteTask(${task.id})">Delete</button></td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch(err => console.error(err));
}


// ===================== ADD CLASS =====================
function addClass() {
  const classNameInput = document.getElementById("className");
  const classMessage = document.getElementById("classMessage");

  if (!classNameInput) return;

  const className = classNameInput.value.trim();

  if (classMessage) {
    classMessage.innerText = "";
    classMessage.style.color = "red";
  }

  if (!className) {
    if (classMessage) {
      classMessage.innerText = "Enter a class name";
    }
    return;
  }

  fetch("http://127.0.0.1:5000/classes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      name: className
    })
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.message || "Failed to add class");
        });
      }
      return res.json();
    })
    .then(data => {
      console.log("Class created:", data);

      classNameInput.value = "";

      if (classMessage) {
        classMessage.style.color = "green";
        classMessage.innerText = "Class added";
      }

      loadClasses();
      loadDashboardData();
    })
    .catch(err => {
      console.error(err);

      if (classMessage) {
        classMessage.style.color = "red";
        classMessage.innerText = err.message;
      }
    });
}


// ===================== DELETE TASK =====================
function deleteTask(id) {
  fetch(`http://127.0.0.1:5000/assignments/${id}`, {
    method: "DELETE",
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to delete task");
      }
      return res.json();
    })
    .then(data => {
      console.log("Task deleted:", data);

      removeRemindersForTask(id);
      loadTasks();
      loadDashboardData();
      loadReminderTaskOptions();
      loadReminders();
    })
    .catch(err => console.error(err));
}


// ===================== LOAD CLASS OPTIONS FOR ADD TASK =====================
function loadClassOptions() {
  fetch("http://127.0.0.1:5000/classes", {
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to load classes");
      }
      return res.json();
    })
    .then(data => {
      const select = document.getElementById("taskClass");
      if (!select) return;

      select.innerHTML = '<option value="">Select Class</option>';

      data.forEach(cls => {
        const option = document.createElement("option");
        option.value = cls.id;
        option.textContent = cls.name;
        select.appendChild(option);
      });
    })
    .catch(err => console.error(err));
}


// ===================== SAVE TASK =====================
function saveTask() {
  const titleInput = document.getElementById("taskTitle");
  const classSelect = document.getElementById("taskClass");
  const dateInput = document.getElementById("taskDate");
  const prioritySelect = document.getElementById("taskPriority");
  const taskMessage = document.getElementById("taskMessage");

  if (!titleInput || !classSelect || !dateInput || !prioritySelect) return;

  const title = titleInput.value.trim();
  const classId = classSelect.value;
  const dueDate = dateInput.value;
  const priority = prioritySelect.value || "Medium";

  if (taskMessage) {
    taskMessage.innerText = "";
    taskMessage.style.color = "red";
  }

  if (!title || !classId) {
    if (taskMessage) {
      taskMessage.innerText = "Title and class are required";
    }
    return;
  }

  fetch("http://127.0.0.1:5000/assignments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      title: title,
      class_id: parseInt(classId),
      due_date: dueDate || null,
      priority: priority
    })
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.message || "Failed to save task");
        });
      }
      return res.json();
    })
    .then(data => {
      console.log("Task created:", data);

      if (taskMessage) {
        taskMessage.style.color = "green";
        taskMessage.innerText = "Task saved";
      }

      titleInput.value = "";
      classSelect.value = "";
      dateInput.value = "";
      prioritySelect.value = "";

      loadDashboardData();
      loadReminderTaskOptions();
    })
    .catch(err => {
      console.error(err);

      if (taskMessage) {
        taskMessage.style.color = "red";
        taskMessage.innerText = err.message;
      }
    });
}


// ===================== PAGE NAVIGATION =====================
function goToRegister() {
  window.location.href = "register.html";
}

function goToAddTask() {
  window.location.href = "add-task.html";
}

function goToTasks() {
  window.location.href = "task-list.html";
}

function goToLogin() {
  window.location.href = "index.html";
}


// ===================== LOAD DASHBOARD DATA =====================
async function loadDashboardData() {
  try {
    const response = await fetch("http://127.0.0.1:5000/dashboard-data", {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to load dashboard data");
    }

    const data = await response.json();
    console.log("Dashboard:", data);
    renderDashboardData(data);
  } catch (error) {
    console.error("Dashboard error:", error);
  }
}


// ===================== RENDER DASHBOARD DATA =====================
function renderDashboardData(data) {
  const welcomeMessage = document.getElementById("welcome-message");
  const totalClasses = document.getElementById("total-classes");
  const totalTasks = document.getElementById("total-tasks");
  const dueThisWeek = document.getElementById("due-this-week");
  const upcomingTasksList = document.getElementById("upcoming-tasks");
  const priorityTasksList = document.getElementById("priority-tasks");

  if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome back, ${data.user}`;
  }

  if (totalClasses) {
    totalClasses.textContent = data.total_classes;
  }

  if (totalTasks) {
    totalTasks.textContent = data.total_tasks;
  }

  if (dueThisWeek) {
    dueThisWeek.textContent = data.due_this_week;
  }

  if (upcomingTasksList) {
    upcomingTasksList.innerHTML = "";

    if (!data.upcoming_tasks || data.upcoming_tasks.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No upcoming tasks";
      upcomingTasksList.appendChild(li);
    } else {
      data.upcoming_tasks.forEach(task => {
        const li = document.createElement("li");
        li.textContent = `${task.title} - ${task.due_date || "No due date"}`;
        upcomingTasksList.appendChild(li);
      });
    }
  }

  if (priorityTasksList) {
    priorityTasksList.innerHTML = "";

    if (!data.priority_tasks || data.priority_tasks.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No priority tasks";
      priorityTasksList.appendChild(li);
    } else {
      data.priority_tasks.forEach(task => {
        const li = document.createElement("li");
        li.textContent = `${task.title} (${task.priority})`;
        priorityTasksList.appendChild(li);
      });
    }
  }
}


// ===================== LOAD TASK OPTIONS FOR REMINDERS =====================
function loadReminderTaskOptions() {
  fetch("http://127.0.0.1:5000/tasks", {
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to load tasks for reminders");
      }
      return res.json();
    })
    .then(data => {
      console.log("Reminder task options:", data);

      const select = document.getElementById("reminderTask");
      if (!select) return;

      select.innerHTML = '<option value="">Select Task</option>';

      data.forEach(task => {
        const option = document.createElement("option");
        option.value = task.id;
        option.textContent = task.title;
        select.appendChild(option);
      });
    })
    .catch(err => console.error(err));
}


// ===================== LOAD REMINDERS =====================
function loadReminders() {
  const tableBody = document.getElementById("reminderTableBody");
  if (!tableBody) return;

  const reminders = JSON.parse(localStorage.getItem("reminders")) || [];

  tableBody.innerHTML = "";

  if (reminders.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="3">No reminders yet</td>`;
    tableBody.appendChild(row);
    return;
  }

  reminders.forEach((reminder, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${reminder.taskTitle}</td>
      <td>${reminder.dateTime}</td>
      <td><button type="button" onclick="deleteReminder(${index})">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });
}


// ===================== ADD REMINDER =====================
function addReminder() {
  const taskSelect = document.getElementById("reminderTask");
  const dateTimeInput = document.getElementById("reminderDateTime");
  const reminderMessage = document.getElementById("reminderMessage");

  if (!taskSelect || !dateTimeInput) return;

  const taskId = taskSelect.value;
  const taskTitle = taskSelect.options[taskSelect.selectedIndex]?.text || "";
  const dateTime = dateTimeInput.value;

  if (reminderMessage) {
    reminderMessage.innerText = "";
    reminderMessage.style.color = "red";
  }

  if (!taskId || !dateTime) {
    if (reminderMessage) {
      reminderMessage.innerText = "Select a task and reminder time";
    }
    return;
  }

  const reminders = JSON.parse(localStorage.getItem("reminders")) || [];

  reminders.push({
    taskId: Number(taskId),
    taskTitle,
    dateTime
  });

  localStorage.setItem("reminders", JSON.stringify(reminders));

  if (reminderMessage) {
    reminderMessage.style.color = "green";
    reminderMessage.innerText = "Reminder added";
  }

  taskSelect.value = "";
  dateTimeInput.value = "";

  loadReminders();
}


// ===================== DELETE REMINDER =====================
function deleteReminder(index) {
  const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
  reminders.splice(index, 1);
  localStorage.setItem("reminders", JSON.stringify(reminders));
  loadReminders();
}


// ===================== REMOVE REMINDERS FOR DELETED TASK =====================
function removeRemindersForTask(taskId) {
  const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
  const updatedReminders = reminders.filter(
    reminder => Number(reminder.taskId) !== Number(taskId)
  );
  localStorage.setItem("reminders", JSON.stringify(updatedReminders));
}


// ===================== LOAD CLASSES =====================
function loadClasses() {
  fetch("http://127.0.0.1:5000/classes", {
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to load classes");
      }
      return res.json();
    })
    .then(data => {
      const classList = document.getElementById("classList");
      if (!classList) return;

      classList.innerHTML = "";

      if (data.length === 0) {
        const item = document.createElement("li");
        item.textContent = "No classes yet";
        classList.appendChild(item);
        return;
      }

      data.forEach(cls => {
        const item = document.createElement("li");
        item.textContent = cls.name;
        classList.appendChild(item);
      });
    })
    .catch(err => console.error(err));
}


// ===================== PAGE LOAD HANDLER =====================
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  if (currentPage === "dashboard.html") {
    loadDashboardData();
  }

  if (currentPage === "tasks.html" || currentPage === "task-list.html") {
    loadTasks();
  }

  if (currentPage === "classes.html" || currentPage === "classes-page.html") {
    loadClasses();
  }

  if (currentPage === "add-task.html") {
    loadClassOptions();
  }

  if (currentPage === "reminders.html") {
    loadReminderTaskOptions();
    loadReminders();
  }
});