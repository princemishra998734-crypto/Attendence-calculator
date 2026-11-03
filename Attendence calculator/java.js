// Get HTML elements
const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");
const loginForm = document.getElementById("loginForm");
const attendanceForm = document.getElementById("attendanceForm");

let total = Number(localStorage.getItem("totalClasses")) || 0;
let present = Number(localStorage.getItem("presentClasses")) || 0;

// LOGIN
loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();

    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("isLoggedIn", "true");

    openDashboard();
});

// OPEN DASHBOARD
function openDashboard() {
    const name = localStorage.getItem("userName") || "Student";

    loginPage.classList.add("hidden");
    appPage.classList.remove("hidden");

    document.getElementById("sidebarName").textContent = name;
    document.getElementById("welcomeName").textContent = name;
    document.getElementById("userAvatar").textContent =
        name.charAt(0).toUpperCase();

    document.getElementById("currentDate").textContent =
        new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

    document.getElementById("totalClasses").value = total || "";
    document.getElementById("presentClasses").value = present || "";

    updateDashboard();
    showSection("dashboard");
}

// NAVIGATION
function showSection(sectionName) {
    document.querySelectorAll(".content-section").forEach(section => {
        section.classList.add("hidden");
    });

    const selectedSection = document.getElementById(sectionName);

    if (!selectedSection) return;

    selectedSection.classList.remove("hidden");

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.section === sectionName
        );
    });

    const titles = {
        dashboard: "Dashboard",
        attendance: "Attendance Calculator",
        bunk: "Bunk Planner"
    };

    document.getElementById("pageTitle").textContent =
        titles[sectionName] || "Dashboard";
}

// SIDEBAR BUTTONS
document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", function () {
        showSection(this.dataset.section);
    });
});

// DASHBOARD BUTTONS
document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", function () {
        showSection(this.dataset.go);
    });
});

// ATTENDANCE CALCULATION
attendanceForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const newTotal = Number(
        document.getElementById("totalClasses").value
    );

    const newPresent = Number(
        document.getElementById("presentClasses").value
    );

    const message = document.getElementById("formMessage");

    if (
        !Number.isInteger(newTotal) ||
        !Number.isInteger(newPresent) ||
        newTotal <= 0 ||
        newPresent < 0 ||
        newPresent > newTotal
    ) {
        message.style.color = "red";
        message.textContent =
            "Please enter valid class numbers. Present cannot exceed total.";
        return;
    }

    total = newTotal;
    present = newPresent;

    localStorage.setItem("totalClasses", total);
    localStorage.setItem("presentClasses", present);

    message.style.color = "green";
    message.textContent = "Attendance updated successfully!";

    updateDashboard();
});

// UPDATE ALL DASHBOARD VALUES
function updateDashboard() {
    const absent = total - present;

    const percentage = total > 0
        ? (present / total) * 100
        : 0;

    const roundedPercentage = percentage.toFixed(1);

    // Statistics
    document.getElementById("totalStat").textContent = total;
    document.getElementById("presentStat").textContent = present;
    document.getElementById("absentStat").textContent = absent;
    document.getElementById("percentageStat").textContent =
        roundedPercentage + "%";

    // Circular chart
    document.getElementById("circlePercent").textContent =
        roundedPercentage + "%";

    document.getElementById("attendanceCircle").style.background =
        `conic-gradient(#7357ed ${percentage}%, #e9eaf2 ${percentage}%)`;

    // Attendance status
    const status = document.getElementById("attendanceStatus");

    if (total === 0) {
        status.textContent = "Add your attendance details";
    } else if (percentage >= 75) {
        status.textContent = "Great! You are maintaining 75% attendance.";
    } else {
        status.textContent = "Warning! Your attendance is below 75%.";
    }

    // 75% goal progress
    const goalProgress = Math.min((percentage / 75) * 100, 100);

    document.getElementById("goalProgress").style.width =
        goalProgress + "%";

    document.getElementById("goalPercent").textContent =
        roundedPercentage + "%";

    let goalMessage = "";

    if (total === 0) {
        goalMessage = "Enter your attendance to calculate your goal.";
    } else if (percentage >= 75) {
        goalMessage = "Congratulations! Your attendance goal is achieved.";
    } else {
        goalMessage = "Attend upcoming classes to reach 75%.";
    }

    document.getElementById("goalMessage").textContent = goalMessage;

    // BUNK CALCULATION
    let bunk = 0;

    if (total > 0 && percentage >= 75) {
        bunk = Math.max(0, Math.floor((present / 0.75) - total + 0.000001));
    }

    document.getElementById("bunkCount").textContent = bunk;

    // CLASSES REQUIRED TO REACH 75%
    let needed = 0;

    if (total > 0 && percentage < 75) {
        needed = Math.ceil(
            ((0.75 * total) - present) / 0.25 - 0.000001
        );
    }

    document.getElementById("neededCount").textContent = needed;

    const neededMessage = document.getElementById("neededMessage");

    if (total === 0) {
        neededMessage.textContent = "Enter your attendance first.";
    } else if (percentage >= 75) {
        neededMessage.textContent = "Your attendance is already 75% or above!";
    } else {
        neededMessage.textContent =
            `Attend the next ${needed} consecutive classes without missing any to reach 75%.`;
    }
}

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("isLoggedIn");

    appPage.classList.add("hidden");
    loginPage.classList.remove("hidden");

    loginForm.reset();
    showSection("dashboard");
});

// KEEP LOGIN AFTER PAGE REFRESH
if (localStorage.getItem("isLoggedIn") === "true") {
    openDashboard();
} else {
    loginPage.classList.remove("hidden");
    appPage.classList.add("hidden");
}