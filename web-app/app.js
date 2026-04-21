// ===================== LOAD CLASSES =====================
// Loads all classes and displays them in the class list
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

        item.innerHTML = `
          <span>${cls.name}</span>
          <button type="button" onclick="deleteClass(${cls.id})">Delete</button>
        `;

        classList.appendChild(item);
      });
    })
    .catch(err => console.error(err));
}