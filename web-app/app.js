// ===================== LOGIN =====================
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const error = document.getElementById("error");

  if (error) error.innerText = "";

  if (!username || !password) {
    if (error) error.innerText = "Please fill out both username and password.";
    return;
  }

  fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Login:", data);

    if (data.message === "Logged in") {
      window.location.href = "dashboard.html";
    } else {
      if (error) error.innerText = data.error || "Login failed";
    }
  })
  .catch(err => {
    console.error(err);
    if (error) error.innerText = "Server error";
  });
}

// ===================== REGISTER =====================
function registerUser() {
  const username = document.getElementById("registerUsername").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const message = document.getElementById("registerMessage");

  if (message) message.innerText = "";

  if (!username || !email || !password) {
    if (message) {
      message.style.color = "red";
      message.innerText = "Fill all fields";
    }
    return;
  }

  fetch("http://127.0.0.1:5000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, email, password })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Register:", data);

    if (message) {
      message.style.color = "green";
      message.innerText = "Account created";
    }

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  })
  .catch(err => {
    console.error(err);
    if (message) {
      message.style.color = "red";
      message.innerText = "Error creating account";
    }
  });
}

// ===================== FORGOT PASSWORD =====================
function forgotPassword() {
  const email = document.getElementById("forgotEmail").value;
  const message = document.getElementById("forgotMessage");

  if (!email) {
    if (message) message.innerText = "Enter your email";
    return;
  }

  if (message) {
    message.innerText = "If this email exists, a reset link would be sent.";
  }
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
  .catch(err => console.log(err));
}

// ===================== LOAD TASKS =====================
function loadTasks() {
  fetch("http://127.0.0.1:5000/tasks", {
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    console.log("Tasks:", data);

    const list = document.getElementById("taskList");
    if (!list) return;

    list.innerHTML = "";

    data.forEach(task => {
      const li = document.createElement("li");
      li.innerText = task.title || "Task";
      list.appendChild(li);
    });
  })
  .catch(err => console.log(err));
}

// ===================== LOAD CLASSES =====================
function loadClasses() {
  fetch("http://127.0.0.1:5000/classes", {
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    console.log("Classes:", data);

    const list = document.getElementById("classList");
    if (!list) return;

    list.innerHTML = "";

    data.forEach(cls => {
      const li = document.createElement("li");
      li.innerText = cls.name || "Class";
      list.appendChild(li);
    });
  })
  .catch(err => console.log(err));
}

// ===================== ADD CLASS =====================
function addClass() {
  const input = document.getElementById("className");
  const newClass = input.value.trim();

  if (!newClass) return;

  fetch("http://127.0.0.1:5000/classes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ name: newClass })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Added class:", data);
    input.value = "";
    loadClasses();
  })
  .catch(err => console.log(err));
}

// ===================== SAVE TASK =====================
function saveTask() {
  const title = document.getElementById("taskTitle").value;
  const taskClass = document.getElementById("taskClass").value;
  const date = document.getElementById("taskDate").value;
  const priority = document.getElementById("taskPriority").value;
  const message = document.getElementById("taskMessage");

  if (!title) {
    if (message) {
      message.style.color = "red";
      message.innerText = "Title is required";
    }
    return;
  }

  // Update field names for consistency with the backend
  fetch("http://127.0.0.1:5000/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      title: title,
      class_id: taskClass,  // class_id instead of class
      due_date: date,       // due_date instead of date
      priority: priority
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Task saved:", data);

    if (message) {
      message.style.color = "green";
      message.innerText = "Task saved!";
    }

    setTimeout(() => {
      goToTasks();
    }, 800);
  })
  .catch(err => {
    console.log(err);
    if (message) {
      message.style.color = "red";
      message.innerText = "Error saving task";
    }
  });
}

// ===================== NAVIGATION =====================
function goToRegister() {
  window.location.href = "register.html";
}

function goToLogin() {
  window.location.href = "index.html";
}

function goToTasks() {
  window.location.href = "task-list.html";
}

function goToAddTask() {
  window.location.href = "add-task.html";
}

// ===================== FETCH CLASSES FOR TASK CREATION =====================
function loadClassesForTaskCreation() {
  fetch("http://127.0.0.1:5000/classes", {
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    const taskClassSelect = document.getElementById("taskClass");
    if (!taskClassSelect) return;

    // Clear current options
    taskClassSelect.innerHTML = '';

    // Add a default "Select a Class" option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.innerText = "Select a Class";
    taskClassSelect.appendChild(defaultOption);

    // Populate dropdown with class names and their respective ids
    data.forEach(cls => {
      const option = document.createElement("option");
      option.value = cls.id; // Use class id here
      option.innerText = cls.name;
      taskClassSelect.appendChild(option);
    });
  })
  .catch(err => console.log(err));
}