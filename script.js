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

// ================= MODALS =================
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

// ================= WINDOW CONTROLS =================

// ---------- MINIMIZE ----------
function minimizeWindow() {
    if (!win) return;
    win.classList.add('minimized'); 
    win.style.display = 'none'; 
    windowState = "minimized";
}

// ---------- RESTORE ----------
function restoreWindow() {
    if (!win) return;
    win.classList.remove('minimized');
    win.style.display = 'block'; 
    
    if (taskbarItem) taskbarItem.style.display = 'flex'; 

    if (windowState === "minimized" || windowState === "closed") {
        windowState = "normal";
    }
}

// ---------- TOGGLE MAXIMIZE ----------
function toggleMaximize() {
    if (!win) return;

    // 1. If minimized, bring it back first
    if (windowState === "minimized") {
        restoreWindow();
    }

    // 2. If already maximized -> RESTORE to normal
    if (windowState === "maximized") {
        win.style.position = ''; // Reset to default/dragged behavior
        win.style.top = '';
        win.style.left = '';
        win.style.width = '';    // Clears '100vw'
        win.style.height = '';   // Clears height calc
        win.style.margin = '';   
        
        // IMPORTANT: Restore the CSS limit so it looks good again
        win.style.maxWidth = ''; 

        windowState = "normal";
        return;
    }

    // 3. Go MAXIMIZE
    win.style.position = 'fixed';
    win.style.top = '0';
    win.style.left = '0';
    win.style.width = '100vw';
    win.style.height = `calc(100vh - ${TASKBAR_HEIGHT}px)`;
    win.style.margin = '0'; 
    
    // IMPORTANT: Remove the CSS limit so it fills the screen
    win.style.maxWidth = 'none'; 
    
    windowState = "maximized";
}

// ---------- CLOSE ----------
function actuallyClose() {
    if (!win) return;
    win.style.display = 'none'; 
    if (taskbarItem) taskbarItem.style.display = 'none';
    windowState = "closed";
    closeCloseDialog();
}

// ---------- OPEN FROM DESKTOP ----------
function openFromDesktop() {
    restoreWindow();
    // Center it nicely on re-open
    win.style.top = '';
    win.style.left = '';
    win.style.position = ''; 
    win.style.transform = ''; // Clear drag transforms if any
    
    if(windowState === "maximized") toggleMaximize(); 
}

// ================= DRAG FUNCTIONALITY =================
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    // The handle is the title bar
    const header = element.querySelector('.title-bar');
    
    if (header) {
        header.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        
        // 1. Stop if window is maximized (Windows behavior)
        if (windowState === 'maximized') return;

        // 2. Prevent dragging if clicking buttons inside title bar
        if (e.target.tagName === 'BUTTON') return;

        e.preventDefault();

        // 3. Prepare for drag: switch from Flex/Relative to Absolute positioning
        // This ensures the window stays exactly where it is visually, but becomes movable
        const rect = element.getBoundingClientRect();
        element.style.position = 'absolute';
        element.style.margin = '0'; // Remove centering margins
        element.style.top = rect.top + "px";
        element.style.left = rect.left + "px";
        element.style.transform = "none"; // Remove any CSS transforms used for centering

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
        // Stop moving when mouse button is released
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

// ================= EVENT LISTENERS =================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Window Controls
    const minBtn = document.querySelector('[aria-label="Minimize"]');
    const maxBtn = document.querySelector('[aria-label="Maximize"]');
    const closeBtn = document.querySelector('[aria-label="Close"]');
    
    if (minBtn) minBtn.addEventListener('click', minimizeWindow);
    if (maxBtn) maxBtn.addEventListener('click', toggleMaximize);
    if (closeBtn) closeBtn.addEventListener('click', showCloseDialog); 

    // 2. Desktop Icon Logic
    if (desktopIcon) desktopIcon.onclick = openFromDesktop;

    // 3. INITIALIZE DRAG
    if (win) makeDraggable(win);

    // 4. Start Button
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
           console.log("Start Clicked");
        });
    }
});