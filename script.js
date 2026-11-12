
// =========================================
// TASK ARENA - JAVASCRIPT
// =========================================


// =========================================
// 1. DEVELOPER-DEFINED DAILY TASKS
// =========================================

// Only the developer edits this list.
// Players cannot add, edit or delete missions.

const DAILY_TASKS = [

    {
        id: "plan-day",
        title: "Plan Your Day",
        description: "Write down your main priorities.",
        category: "Planning",
        points: 10,
        icon: "🗓️"
    },

    {
        id: "learn",
        title: "Learn Something New",
        description: "Spend time learning a useful skill.",
        category: "Learning",
        points: 15,
        icon: "📚"
    },

    {
        id: "reading",
        title: "Read for 20 Minutes",
        description: "Read a book or educational article.",
        category: "Reading",
        points: 10,
        icon: "📖"
    },

    {
        id: "workspace",
        title: "Organise Your Workspace",
        description: "Prepare your desk and study area.",
        category: "Productivity",
        points: 10,
        icon: "✨"
    },

    {
        id: "review",
        title: "Review Your Progress",
        description: "Reflect on what you have accomplished.",
        category: "Reflection",
        points: 15,
        icon: "🎯"
    }

];


// Demonstration players.
// These are not real online players.

const DEMO_PLAYERS = [

    { name: "Alex", points: 150 },

    { name: "Sophia", points: 120 },

    { name: "Daniel", points: 90 }

];


// =========================================
// 2. DEFAULT PLAYER DATA
// =========================================

const STORAGE_KEY = "taskArenaData_v1";

const defaultState = {

    playerName: "Guest",

    points: 0,

    completedTasksByDate: {}

};


// =========================================
// 3. DATE FUNCTIONS
// =========================================

function getTodayKey() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1)
        .padStart(2, "0");

    const day = String(date.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function formatToday() {

    return new Intl.DateTimeFormat(undefined, {

        weekday: "long",

        month: "long",

        day: "numeric"

    }).format(new Date());

}


// =========================================
// 4. LOAD SAVED DATA
// =========================================

function loadState() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {

            return {
                ...defaultState,
                completedTasksByDate: {}
            };

        }

        const data = JSON.parse(saved);

        return {

            playerName:
                typeof data.playerName === "string" &&
                data.playerName.trim().length >= 2

                    ? data.playerName.trim().slice(0, 18)

                    : "Guest",

            points:
                Number.isSafeInteger(data.points) &&
                data.points >= 0

                    ? data.points

                    : 0,

            completedTasksByDate:
                data.completedTasksByDate &&
                typeof data.completedTasksByDate === "object" &&
                !Array.isArray(data.completedTasksByDate)

                    ? data.completedTasksByDate

                    : {}

        };

    } catch (error) {

        console.error("Could not load saved data:", error);

        return {
            ...defaultState,
            completedTasksByDate: {}
        };

    }

}


let state = loadState();


// =========================================
// 5. SELECT HTML ELEMENTS
// =========================================

const elements = {

    todayDate:
        document.getElementById("today-date"),

    currentYear:
        document.getElementById("current-year"),

    profileForm:
        document.getElementById("profile-form"),

    playerName:
        document.getElementById("player-name"),

    profileMessage:
        document.getElementById("profile-message"),

    displayName:
        document.getElementById("display-name"),

    avatar:
        document.getElementById("avatar-initials"),

    points:
        document.getElementById("points"),

    level:
        document.getElementById("level-pill"),

    progressRing:
        document.getElementById("progress-ring"),

    progressPercent:
        document.getElementById("progress-percent"),

    completedCount:
        document.getElementById("completed-count"),

    totalCount:
        document.getElementById("total-count"),

    progressFill:
        document.getElementById("progress-fill"),

    progressMessage:
        document.getElementById("progress-message"),

    todayPoints:
        document.getElementById("today-points"),

    taskCount:
        document.getElementById("task-count-badge"),

    taskList:
        document.getElementById("task-list"),

    leaderboard:
        document.getElementById("leaderboard-list"),

    rank:
        document.getElementById("player-rank"),

    toast:
        document.getElementById("toast")

};


// =========================================
// 6. SAVE PLAYER DATA
// =========================================

function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

        return true;

    } catch (error) {

        console.error("Could not save data:", error);

        return false;

    }

}


// =========================================
// 7. GET COMPLETED TASKS
// =========================================

function getCompletedTaskIds() {

    const today = getTodayKey();

    const savedIds =
        state.completedTasksByDate[today];

    if (!Array.isArray(savedIds)) {

        return [];

    }

    const validIds = new Set(

        DAILY_TASKS.map(task => task.id)

    );

    return [...new Set(

        savedIds.filter(id => validIds.has(id))

    )];

}


function getCompletedTasks() {

    const completedIds =
        new Set(getCompletedTaskIds());

    return DAILY_TASKS.filter(task => {

        return completedIds.has(task.id);

    });

}


// =========================================
// 8. NOTIFICATION FUNCTION
// =========================================

let toastTimer;

function showToast(message) {

    elements.toast.textContent = message;

    elements.toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        elements.toast.classList.remove("show");

    }, 2500);

}


// =========================================
// 9. CREATE HTML ELEMENTS
// =========================================

function createElement(tag, className, text) {

    const element = document.createElement(tag);

    if (className) {

        element.className = className;

    }

    if (text !== undefined) {

        element.textContent = text;

    }

    return element;

}


// =========================================
// 10. DISPLAY PLAYER PROFILE
// =========================================

function renderProfile() {

    elements.displayName.textContent =
        state.playerName;

    elements.playerName.value =
        state.playerName;

    elements.points.textContent =
        state.points.toLocaleString();


    const initial =
        state.playerName.charAt(0).toUpperCase();

    elements.avatar.textContent = initial || "G";


    const level =
        Math.floor(state.points / 100) + 1;

    elements.level.textContent =
        `LEVEL ${level}`;

}


// =========================================
// 11. DISPLAY DAILY TASKS
// =========================================

function renderTasks() {

    elements.taskList.replaceChildren();

    elements.taskCount.textContent =
        `${DAILY_TASKS.length} MISSIONS`;


    if (DAILY_TASKS.length === 0) {

        const emptyMessage = createElement(

            "p",

            "empty-task-message",

            "No missions have been assigned yet."

        );

        elements.taskList.appendChild(emptyMessage);

        return;

    }


    const completedIds =
        new Set(getCompletedTaskIds());


    DAILY_TASKS.forEach(task => {

        const completed =
            completedIds.has(task.id);


        const row = createElement(

            "article",

            completed
                ? "mission-row is-complete"
                : "mission-row"

        );


        const icon = createElement(

            "span",

            "mission-icon",

            task.icon

        );


        const copy = createElement(

            "div",

            "mission-copy"

        );


        const title = createElement(

            "strong",

            "",

            task.title

        );


        const description = createElement(

            "p",

            "",

            task.description

        );


        const meta = createElement(

            "div",

            "mission-meta"

        );


        const category = createElement(

            "span",

            "mission-category",

            task.category

        );


        const reward = createElement(

            "span",

            "mission-points",

            `+${task.points} PTS`

        );


        meta.append(category, reward);

        copy.append(title, description, meta);


        const button = createElement(

            "button",

            "complete-button",

            completed
                ? "✓ Completed"
                : `Complete · +${task.points}`

        );


        button.type = "button";

        button.dataset.taskId = task.id;

        button.disabled = completed;


        row.append(icon, copy, button);

        elements.taskList.appendChild(row);

    });

}


// =========================================
// 12. DISPLAY DAILY PROGRESS
// =========================================

function renderProgress() {

    const completedTasks =
        getCompletedTasks();

    const completed =
        completedTasks.length;

    const total =
        DAILY_TASKS.length;


    const percentage = total === 0

        ? 0

        : Math.round((completed / total) * 100);


    const pointsToday = completedTasks.reduce(

        (totalPoints, task) => {

            return totalPoints + task.points;

        },

        0

    );


    elements.completedCount.textContent =
        completed;

    elements.totalCount.textContent =
        total;

    elements.progressPercent.textContent =
        `${percentage}%`;


    elements.progressRing.style.setProperty(

        "--progress",

        `${percentage}%`

    );


    elements.progressFill.style.width =
        `${percentage}%`;


    elements.todayPoints.textContent =
        `${pointsToday} PTS`;


    if (total === 0) {

        elements.progressMessage.textContent =
            "Waiting for developer missions.";

    } else if (completed === total) {

        elements.progressMessage.textContent =
            "All missions completed! Excellent work.";

    } else if (completed === 0) {

        elements.progressMessage.textContent =
            "Your first victory is waiting.";

    } else {

        elements.progressMessage.textContent =
            "Great progress! Keep going.";

    }

}


// =========================================
// 13. DISPLAY LEADERBOARD
// =========================================

function renderLeaderboard() {

    elements.leaderboard.replaceChildren();


    const playerNameKey =
        state.playerName.toLowerCase();


    const players = DEMO_PLAYERS

        .filter(player => {

            return player.name.toLowerCase() !== playerNameKey;

        })

        .map(player => ({

            name: player.name,

            points: player.points,

            isCurrentPlayer: false

        }));


    players.push({

        name: state.playerName,

        points: state.points,

        isCurrentPlayer: true

    });


    players.sort((a, b) => {

        return b.points - a.points;

    });


    const rank = players.findIndex(player => {

        return player.isCurrentPlayer;

    }) + 1;


    elements.rank.textContent =
        `#${rank}`;


    players.forEach((player, index) => {

        const row = createElement(

            "li",

            player.isCurrentPlayer
                ? "leaderboard-entry is-you"
                : "leaderboard-entry"

        );


        const rankNumber = createElement(

            "span",

            "rank-number",

            `#${index + 1}`

        );


        const person = createElement(

            "div",

            "leaderboard-person"

        );


        const name = createElement(

            "strong",

            "",

            player.isCurrentPlayer
                ? `${player.name} (You)`
                : `${player.name} (Demo)`

        );


        const label = createElement(

            "span",

            "",

            player.isCurrentPlayer
                ? "Your local profile"
                : "Sample player"

        );


        const score = createElement(

            "span",

            "leaderboard-score",

            `${player.points} PTS`

        );


        person.append(name, label);

        row.append(rankNumber, person, score);

        elements.leaderboard.appendChild(row);

    });

}


// =========================================
// 14. SAVE PLAYER NAME
// =========================================

elements.profileForm.addEventListener(

    "submit",

    function(event) {

        event.preventDefault();


        const name =
            elements.playerName.value.trim();


        if (name.length < 2) {

            elements.profileMessage.textContent =
                "Please enter at least 2 characters.";

            return;

        }


        state.playerName =
            name.slice(0, 18);


        const saved = saveState();


        renderProfile();

        renderLeaderboard();


        elements.profileMessage.textContent = saved

            ? "Your profile has been saved."

            : "Your name changed, but saving failed.";

    }

);


// =========================================
// 15. COMPLETE DAILY TASKS
// =========================================

elements.taskList.addEventListener(

    "click",

    function(event) {


        const button =
            event.target.closest("button[data-task-id]");


        if (!button) {

            return;

        }


        const task = DAILY_TASKS.find(item => {

            return item.id === button.dataset.taskId;

        });


        if (!task) {

            showToast("Mission not found.");

            return;

        }


        const completedIds =
            getCompletedTaskIds();


        // Prevent duplicate points

        if (completedIds.includes(task.id)) {

            showToast("You already completed this mission today.");

            return;

        }


        const today = getTodayKey();


        state.completedTasksByDate[today] = [

            ...completedIds,

            task.id

        ];


        // Award points

        state.points += task.points;


        saveState();


        // Refresh the dashboard

        renderAll();


        showToast(

            `Mission completed! +${task.points} points.`

        );

    }

);


// =========================================
// 16. REFRESH THE WHOLE DASHBOARD
// =========================================

function renderAll() {

    renderProfile();

    renderTasks();

    renderProgress();

    renderLeaderboard();

}


// =========================================
// 17. START THE WEBSITE
// =========================================

function initialiseTaskArena() {

    elements.todayDate.textContent =
        formatToday();


    elements.currentYear.textContent =
        new Date().getFullYear();


    renderAll();

}


initialiseTaskArena();
