// Base URL for backend API
const API_BASE = "http://127.0.0.1:5000";

// Handles fetch responses so we don’t repeat error logic everywhere
async function handleResponse(res) {
  if (!res.ok) {
    let errorMessage = "Request failed";

    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(errorMessage);
  }

  return res.json();
}

// ===================== LOGIN =====================
async function login() {
  const username = document.getElementById("username")?.value;
  const password = document.getElementById("password")?.value;
  const error = document.getElementById("error");

  if (error) error.innerText = "";

  if (!username || !password) {
    if (error) error.innerText = "Fill all fields";
    return;
  }

 try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    const data = await handleResponse(res);

    if (data.message === "Logged in") {
      window.location.href = "dashboard.html";
    }
  } catch (err) {
    console.error(err);
    if (error) error.innerText = err.message;
  }
}

// ===================== FORGOT PASSWORD =====================
function forgotPassword() {
  const email = prompt("Enter your email to reset your password:");

  if (!email) {
    alert("Email is required");
    return;
  }

  fetch("http://127.0.0.1:5000/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: email })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Forgot Password:", data);
      alert(data.message || "If this email exists, a reset link was sent.");
    })
    .catch(err => {
      console.error(err);
      alert("Error sending reset request");
    });
}

// ===================== REGISTER =====================
function registerUser(event) {
  if (event) event.preventDefault();

  const username = document.getElementById("registerUsername")?.value;
  const password = document.getElementById("registerPassword")?.value;
  const email = document.getElementById("registerEmail")?.value;
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
      email: email,
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

// ===================== DELETE CLASS =====================
// NEW: deletes a class and refreshes UI
function deleteClass(classId) {
  const confirmDelete = confirm("Are you sure you want to delete this class?");
  if (!confirmDelete) return;

  fetch(`http://127.0.0.1:5000/classes/${classId}`, {
    method: "DELETE",
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.message || "Failed to delete class");
        });
      }
      return res.json();
    })
    .then(data => {
      console.log("Class deleted:", data);

      loadClasses();
      loadDashboardData();
      loadClassOptions();
    })
    .catch(err => {
      console.error(err);
      alert(err.message || "Error deleting class");
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