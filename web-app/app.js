// ===================== LOGIN =====================
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
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
      email: username,
      password: password
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Login:", data);

    if (data.message || data.user) {
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

  // backend may not support this yet → placeholder
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
//added this
// ===================== REDIRECTION FUNCTIONS =====================
// Redirects to the registration page
function goToRegister() {
  window.location.href = "register.html";  // Redirect to the register page
}

// Redirects to the login page
function goToLogin() {
  window.location.href = "index.html";  // Redirect to the login page
}