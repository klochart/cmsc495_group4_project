// calendar.js - Handles loading and showing calendar view with assignments

const API_URL = "http://127.0.0.1:5000";

function loadCalendar() {
  const calendarGrid = document.getElementById("calendarGrid");
  if (!calendarGrid) return;

  fetch(`${API_URL}/assignments/all`, {
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to load calendar events");
      }
      return res.json();
    })
    .then(assignments => buildCalendar(assignments))
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

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(dayName => {
    const header = document.createElement("div");
    header.className = "calendar-weekday";
    header.textContent = dayName;
    calendarGrid.appendChild(header);
  });

  const eventsByDate = {};
  assignments.forEach(item => {
    if (!item.due_date) return;
    eventsByDate[item.due_date] = eventsByDate[item.due_date] || [];
    eventsByDate[item.due_date].push(item);
  });

  for (let cellIndex = 0; cellIndex < 42; cellIndex++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    if (cellIndex < startDay || cellIndex >= startDay + daysInMonth) {
      cell.classList.add("calendar-cell-outside");
      calendarGrid.appendChild(cell);
      continue;
    }

    const day = cellIndex - startDay + 1;
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dateNumber = document.createElement("div");
    dateNumber.className = "calendar-date";
    dateNumber.textContent = day;
    cell.appendChild(dateNumber);

    const events = eventsByDate[dateKey] || [];
    if (events.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "calendar-no-events";
      emptyMessage.textContent = "No tasks";
      cell.appendChild(emptyMessage);
    } else {
      const list = document.createElement("div");
      list.className = "calendar-events";
      events.slice(0, 3).forEach(event => {
        const pill = document.createElement("div");
        pill.className = "event-pill";
        pill.textContent = `${event.title} (${event.class_name})`;
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

document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname.split("/").pop();
  if (page === "calendar.html") {
    loadCalendar();
  }
});
