//calendar.js - local and render

const API_URL =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://cmsc495-group4-project.onrender.com";

function loadCalendar() {
  const calendarGrid = document.getElementById("calendarGrid");
  if (!calendarGrid) return;



  fetch(`${API_URL}/tasks`, {
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to load calendar tasks");
      }
      return res.json();
    })
    .then(data => buildCalendar(data))
    .catch(err => {
      console.error(err);
      calendarGrid.innerHTML = "<p>Unable to load calendar events.</p>";
    });
}

function buildCalendar(assignments) {
  const calendarGrid = document.getElementById("calendarGrid");
  const monthTitle = document.getElementById("calendarMonth");

  if (!calendarGrid || !monthTitle) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay.getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  monthTitle.textContent = `${monthNames[month]} ${year}`;
  calendarGrid.innerHTML = "";

  // Weekday headers
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
    const header = document.createElement("div");
    header.className = "calendar-weekday";
    header.textContent = day;
    calendarGrid.appendChild(header);
  });

  const eventsByDate = {};

  // Normalize backend data safely
  assignments.forEach(item => {
    if (!item.due_date) return;


    const dateKey = item.due_date.split("T")[0];

    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }

    eventsByDate[dateKey].push(item);
  });

  // Build calendar grid
  for (let i = 0; i < 42; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    // Empty outside month days
    if (i < startDay || i >= startDay + daysInMonth) {
      cell.classList.add("calendar-cell-outside");
      calendarGrid.appendChild(cell);
      continue;
    }

    const day = i - startDay + 1;

    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dateNumber = document.createElement("div");
    dateNumber.className = "calendar-date";
    dateNumber.textContent = day;
    cell.appendChild(dateNumber);

    const events = eventsByDate[dateKey] || [];

    if (events.length === 0) {
      const empty = document.createElement("div");
      empty.className = "calendar-no-events";
      empty.textContent = "No tasks";
      cell.appendChild(empty);
    } else {
      const list = document.createElement("div");
      list.className = "calendar-events";

      events.slice(0, 3).forEach(event => {
        const pill = document.createElement("div");
        pill.className = "event-pill";


        const className = event.class_name || event.class || "No Class";

        pill.textContent = `${event.title} (${className})`;

        list.appendChild(pill);
      });

      if (events.length > 3) {
        const more = document.createElement("div");
        more.className = "event-pill event-more";
        more.textContent = `+ ${events.length - 3} more`;
        list.appendChild(more);
      }

      cell.appendChild(list);
    }

    calendarGrid.appendChild(cell);
  }
}

// Auto-load only on calendar page
document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname.split("/").pop();

  if (page === "calendar.html") {
    loadCalendar();
  }
});
function logout() {
  fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include"
  })
    .then(() => {
      window.location.href = "login.html";
    })
    .catch(err => {
      console.error("Logout failed:", err);
      window.location.href = "login.html"; // fallback
    });
}