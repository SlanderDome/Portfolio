// ================= GLOBAL WINDOW STATE =================
let windowState = "normal"; // normal | minimized | maximized | closed
const win = document.querySelector('.window');
const taskbarItem = document.querySelector('.taskbar-item');
const desktopIcon = document.querySelector('.desktop-icon');
const TASKBAR_HEIGHT = 40;

// ================= CLOCK =================
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.textContent = timeString;
}
setInterval(updateClock, 1000);
updateClock();

// ================= TABS =================
function switchTab(index) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));

    if (tabs[index]) tabs[index].classList.add('active');
    if (contents[index]) contents[index].classList.add('active');
}

// ================= MODALS & MENUS =================
function showAbout() {
    const modal = document.getElementById('aboutModal');
    if (modal) modal.classList.add('active');
}
function closeAbout() {
    const modal = document.getElementById('aboutModal');
    if (modal) modal.classList.remove('active');
}
function showCloseDialog() {
    const modal = document.getElementById('closeModal');
    if (modal) modal.classList.add('active');
}
function closeCloseDialog() {
    const modal = document.getElementById('closeModal');
    if (modal) modal.classList.remove('active');
}

// Menu Functions
function toggleMenu(menuId, event) {
    event.stopPropagation();
    closeAllMenus();
    const menu = document.getElementById(menuId);
    if (menu) menu.classList.toggle('show');
}
function closeAllMenus() {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show'));
}
document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-item')) closeAllMenus();
});

// Edit Actions
function copyEmail() {
    navigator.clipboard.writeText("swarom66@gmail.com").then(() => alert("Email copied!"));
    closeAllMenus();
}
function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => alert("Link copied!"));
    closeAllMenus();
}

// ================= WINDOW CONTROLS =================
function minimizeWindow() {
    if (!win) return;
    win.classList.add('minimized'); 
    win.style.display = 'none'; 
    windowState = "minimized";
}

function restoreWindow() {
    if (!win) return;
    win.classList.remove('minimized');
    win.style.display = 'block'; 
    if (taskbarItem) taskbarItem.style.display = 'flex'; 
    if (windowState === "minimized" || windowState === "closed") windowState = "normal";
}

function toggleMaximize() {
    if (!win) return;
    if (windowState === "minimized") restoreWindow();

    if (windowState === "maximized") {
        win.style.position = ''; 
        win.style.top = '';
        win.style.left = '';
        win.style.width = '';
        win.style.height = '';
        win.style.margin = '';   
        win.style.maxWidth = ''; // Restore limit
        windowState = "normal";
        return;
    }

    win.style.position = 'fixed';
    win.style.top = '0';
    win.style.left = '0';
    win.style.width = '100vw';
    win.style.height = `calc(100vh - ${TASKBAR_HEIGHT}px)`;
    win.style.margin = '0'; 
    win.style.maxWidth = 'none'; // Remove limit
    windowState = "maximized";
}

function actuallyClose() {
    if (!win) return;
    win.style.display = 'none'; 
    if (taskbarItem) taskbarItem.style.display = 'none';
    windowState = "closed";
    closeCloseDialog();
}

function openFromDesktop() {
    restoreWindow();
    // Reset positions so it doesn't open off-screen if it was dragged there
    win.style.top = '10%'; 
    win.style.left = '10%';
    win.style.position = 'absolute'; 
    if(windowState === "maximized") toggleMaximize(); 
}

// ================= DRAG FUNCTIONALITY (UPDATED) =================
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    // UPDATED: Check if a title bar exists. If NOT, use the whole element as the handle.
    const header = element.querySelector('.title-bar');
    const handle = header || element; 

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        
        // 1. Stop if window is maximized
        if (element.classList.contains('window') && windowState === 'maximized') return;

        // 2. Prevent dragging if clicking buttons
        if (e.target.tagName === 'BUTTON') return;

        e.preventDefault();

        // 3. Switch to absolute positioning for dragging
        // We do this check so we don't reset position if it's already dragged
        const cssPosition = window.getComputedStyle(element).position;
        if (cssPosition !== 'absolute' && cssPosition !== 'fixed') {
             const rect = element.getBoundingClientRect();
             element.style.position = 'absolute';
             element.style.margin = '0';
             element.style.top = rect.top + "px";
             element.style.left = rect.left + "px";
        }

        // 4. Get mouse start position
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Calculate new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Set element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// ================= DOWNLOAD CV =================
function downloadResume() {
    const link = document.createElement('a');
    link.href = 'resume.pdf'; 
    link.download = 'Resume.pdf';
    link.click();
}

// ================= STATUS BAR =================
let visitors = 1337;
const visitorEl = document.getElementById('visitor-count');
if (visitorEl) {
    setInterval(() => {
        visitors++;
        visitorEl.textContent = `Visitors: ${visitors}`;
    }, 5000);
}

window.onload = () => {
    const loadEl = document.getElementById('load-time');
    if (loadEl) {
        const loadTime = (Math.random() * 0.5 + 0.2).toFixed(2);
        loadEl.textContent = `Load: ${loadTime}s`;
    }
};

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initialize Window Drag
    if (win) makeDraggable(win);

    // 2. Initialize Desktop Icon Drag (NEW)
    // Select ALL desktop icons in case you add more later
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
        makeDraggable(icon);
        
        // IMPORTANT: Switch to Double Click to open
        icon.onclick = null; // Remove single click
        icon.ondblclick = openFromDesktop; // Add double click
    });

    // 3. Button Wiring
    const minBtn = document.querySelector('[aria-label="Minimize"]');
    const maxBtn = document.querySelector('[aria-label="Maximize"]');
    const closeBtn = document.querySelector('[aria-label="Close"]');
    
    if (minBtn) minBtn.addEventListener('click', minimizeWindow);
    if (maxBtn) maxBtn.addEventListener('click', toggleMaximize);
    if (closeBtn) closeBtn.addEventListener('click', showCloseDialog); 
    
    // 4. Start Button
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
           console.log("Start Clicked");
        });
    }
});
// ================= SNAKE GAME LOGIC =================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

// Game Config
const box = 20; // Size of one square
let snake = [];
let food = {};
let score = 0;
let d; // Direction
let gameInterval;
let isGameRunning = false;

// Initialize Game
function startGame() {
    if(isGameRunning) clearInterval(gameInterval); // Reset if running
    
    // Reset State
    snake = [];
    snake[0] = { x: 9 * box, y: 10 * box }; // Start position
    score = 0;
    d = null; // Wait for input
    scoreEl.innerText = score;
    isGameRunning = true;
    
    // Generate first food
    generateFood();
    
    // Start Loop (100ms speed)
    clearInterval(gameInterval);
    gameInterval = setInterval(drawGame, 100);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width/box)) * box,
        y: Math.floor(Math.random() * (canvas.height/box)) * box
    };
    // Don't spawn on snake body
    for(let i=0; i<snake.length; i++){
        if(food.x == snake[i].x && food.y == snake[i].y){
            generateFood();
        }
    }
}

// Input Listener
document.addEventListener("keydown", direction);

function direction(event) {
    // Prevent scrolling when playing
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
        event.preventDefault();
    }

    let key = event.keyCode;
    if( key == 37 && d != "RIGHT") d = "LEFT";
    else if(key == 38 && d != "DOWN") d = "UP";
    else if(key == 39 && d != "LEFT") d = "RIGHT";
    else if(key == 40 && d != "UP") d = "DOWN";
}

function drawGame() {
    // Draw Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Draw Snake
    for( let i = 0; i < snake.length; i++){
        ctx.fillStyle = ( i == 0 ) ? "lime" : "green"; // Head is lime
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        
        ctx.strokeStyle = "black";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Old Head Position
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // Move logic
    if( d == "LEFT") snakeX -= box;
    if( d == "UP") snakeY -= box;
    if( d == "RIGHT") snakeX += box;
    if( d == "DOWN") snakeY += box;

    // If game hasn't started moving yet, don't update
    if (!d) return; 

    // Eat Food
    if(snakeX == food.x && snakeY == food.y){
        score++;
        scoreEl.innerText = score;
        generateFood();
        // Don't pop the tail (snake grows)
    } else {
        // Remove tail
        snake.pop();
    }

    // New Head
    let newHead = { x : snakeX, y : snakeY };

    // Game Over Rules
    if(snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)){
        clearInterval(gameInterval);
        isGameRunning = false;
        alert("GAME OVER! Score: " + score);
    }

    snake.unshift(newHead);
}

function collision(head, array){
    for(let i = 0; i < array.length; i++){
        if(head.x == array[i].x && head.y == array[i].y){
            return true;
        }
    }
    return false;
}
// Start Menu Toggle
const startBtn = document.querySelector('.start-btn');
const startMenu = document.getElementById('startMenu');

startBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    startMenu.classList.toggle('active');
    startBtn.classList.toggle('active');
});

// Close start menu when clicking outside
document.addEventListener('click', function(e) {
    if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
        startMenu.classList.remove('active');
        startBtn.classList.remove('active');
    }
});

// Start menu item clicks
document.querySelectorAll('.start-menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        if (!this.classList.contains('shutdown') && !this.classList.contains('has-arrow')) {
            e.stopPropagation();
            alert('Opening: ' + this.textContent.trim());
            startMenu.classList.remove('active');
            startBtn.classList.remove('active');
        }
    });
});

// Shutdown Dialog Functions
function showShutdownDialog() {
    document.getElementById('shutdownModal').classList.add('active');
    startMenu.classList.remove('active');
    startBtn.classList.remove('active');
}

function closeShutdown() {
    document.getElementById('shutdownModal').classList.remove('active');
}

function performShutdown() {
    const selected = document.querySelector('input[name="shutdown"]:checked');
    const action = selected.parentElement.textContent.trim();
    alert('Performing: ' + action + '\n\nJust kidding! This is a portfolio website 😄');
    closeShutdown();
}
// ... end of DOMContentLoaded ...