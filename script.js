// ===================================================================
//  PORTFOLIO.EXE — Windows XP Retro Portfolio
//  Full interactive JavaScript
// ===================================================================

// ================= GLOBALS =================
let windowState = "normal"; // normal | minimized | maximized | closed
const TASKBAR_HEIGHT = 36;
const wallpapers = ['wallpaper2.mp4', 'wallpaper.mp4', 'wallpaper3.mp4', 'wallpaper4.mp4', 'wallpaper5.mp4'];
let currentWallpaper = 0;
let commandHistory = [];
let historyIndex = -1;

// DOM refs (set after DOM ready)
let win, taskbarItem, startBtn, startMenu;

// ================= BOOT SEQUENCE =================
function runBootSequence() {
    const bootScreen = document.getElementById('bootScreen');
    const biosPhase = document.getElementById('biosPhase');
    const xpLoadPhase = document.getElementById('xpLoadPhase');
    const welcomePhase = document.getElementById('welcomePhase');

    if (!bootScreen) return;

    // Skip boot on keypress
    const skipBoot = () => {
        bootScreen.classList.add('fade-out');
        setTimeout(() => {
            bootScreen.classList.add('hidden');
            initDesktop();
        }, 800);
        document.removeEventListener('keydown', skipBoot);
        document.removeEventListener('click', skipBoot);
    };

    document.addEventListener('keydown', skipBoot);
    // Don't skip on click during first 1 second to avoid accidental skip
    setTimeout(() => document.addEventListener('click', skipBoot), 1000);

    // Phase 1: BIOS (0-3 seconds)
    // BIOS lines animate via CSS

    // Phase 2: XP Loading (3-5.5 seconds)
    setTimeout(() => {
        biosPhase.style.display = 'none';
        xpLoadPhase.classList.add('active');
    }, 3000);

    // Phase 3: Welcome (5.5-7 seconds)
    setTimeout(() => {
        xpLoadPhase.classList.remove('active');
        xpLoadPhase.style.display = 'none';
        welcomePhase.classList.add('active');
    }, 5500);

    // Reveal desktop (7 seconds)
    setTimeout(() => {
        bootScreen.classList.add('fade-out');
        setTimeout(() => {
            bootScreen.classList.add('hidden');
            initDesktop();
        }, 800);
        document.removeEventListener('keydown', skipBoot);
        document.removeEventListener('click', skipBoot);
    }, 7000);
}

// ================= DESKTOP INIT =================
function initDesktop() {
    // Focus terminal input
    const cmdInput = document.getElementById('cmdInput');
    if (cmdInput) cmdInput.focus();
}

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

// ================= TABS =================
function switchTab(index) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));

    if (tabs[index]) tabs[index].classList.add('active');
    if (contents[index]) {
        contents[index].classList.add('active');
        // Re-trigger tab slide animation
        contents[index].style.animation = 'none';
        contents[index].offsetHeight; // Trigger reflow
        contents[index].style.animation = '';
    }

    // If switching to Skills tab, animate progress bars
    if (index === 2) {
        // animation logic removed
    }

    // Focus terminal if CMD tab
    if (index === 0) {
        const cmdInput = document.getElementById('cmdInput');
        if (cmdInput) cmdInput.focus();
    }
}


// ================= MODALS =================
function showAbout() {
    const modal = document.getElementById('aboutModal');
    if (modal) modal.classList.add('active');
    closeAllMenus();
    closeStartMenu();
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

// ================= MENU FUNCTIONS =================
function toggleMenu(menuId, event) {
    event.stopPropagation();
    const clickedMenu = document.getElementById(menuId);
    const wasOpen = clickedMenu && clickedMenu.classList.contains('show');
    closeAllMenus();
    if (clickedMenu && !wasOpen) clickedMenu.classList.toggle('show');
}

function closeAllMenus() {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show'));
}

// ================= EDIT ACTIONS =================
function copyEmail() {
    navigator.clipboard.writeText("swarom66@gmail.com").then(() => {
        showNotification("📋 Email copied to clipboard!");
    });
    closeAllMenus();
    closeStartMenu();
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showNotification("🔗 Link copied to clipboard!");
    });
    closeAllMenus();
    closeStartMenu();
}

// Mini notification toast
function showNotification(msg) {
    let toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 50px; right: 20px;
        background: #ffffcc; border: 1px solid #aca899;
        border-radius: 4px; padding: 8px 16px; font-size: 13px;
        box-shadow: 2px 2px 8px rgba(0,0,0,0.2); z-index: 99999;
        font-family: 'Segoe UI', sans-serif; animation: menuDrop 0.2s ease-out;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ================= WINDOW CONTROLS =================
function minimizeWindow() {
    if (!win) return;
    win.classList.add('minimizing');
    setTimeout(() => {
        win.classList.remove('minimizing');
        win.classList.add('minimized');
        win.style.display = 'none';
        windowState = "minimized";
        // Flash taskbar item
        if (taskbarItem) {
            taskbarItem.classList.remove('active-task');
            taskbarItem.classList.add('flashing');
            setTimeout(() => taskbarItem.classList.remove('flashing'), 1500);
        }
    }, 300);
}

function restoreWindow() {
    if (!win) return;
    win.style.display = '';
    win.classList.remove('minimized');
    win.classList.add('restoring');
    setTimeout(() => win.classList.remove('restoring'), 300);
    if (taskbarItem) {
        taskbarItem.style.display = 'flex';
        taskbarItem.classList.add('active-task');
    }
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
        win.style.maxWidth = '';
        win.style.borderRadius = '';
        windowState = "normal";
        return;
    }

    win.style.position = 'fixed';
    win.style.top = '0';
    win.style.left = '0';
    win.style.width = '100vw';
    win.style.height = `calc(100vh - ${TASKBAR_HEIGHT}px)`;
    win.style.margin = '0';
    win.style.maxWidth = 'none';
    win.style.borderRadius = '0';
    windowState = "maximized";
    closeAllMenus();
}

function actuallyClose() {
    if (!win) return;
    win.classList.add('minimizing');
    setTimeout(() => {
        win.style.display = 'none';
        win.classList.remove('minimizing');
        if (taskbarItem) taskbarItem.style.display = 'none';
        windowState = "closed";
        closeCloseDialog();
    }, 300);
}

function openFromDesktop() {
    restoreWindow();
    if (windowState === "maximized") toggleMaximize();
}

// ================= DRAG FUNCTIONALITY =================
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.title-bar');
    const handle = header || element;

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        if (element.classList.contains('window') && windowState === 'maximized') return;
        if (e.target.tagName === 'BUTTON') return;
        e.preventDefault();

        const cssPosition = window.getComputedStyle(element).position;
        if (cssPosition !== 'absolute' && cssPosition !== 'fixed') {
            const rect = element.getBoundingClientRect();
            element.style.position = 'absolute';
            element.style.margin = '0';
            element.style.top = rect.top + "px";
            element.style.left = rect.left + "px";
        }

        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// ================= DOWNLOAD RESUME =================
function downloadResume() {
    const link = document.createElement('a');
    link.href = 'Swarom_Resume.pdf';
    link.download = 'Swarom_Resume.pdf';
    link.click();
    closeAllMenus();
    closeStartMenu();
}

// ================= WALLPAPER CYCLING =================
function cycleWallpaper() {
    currentWallpaper = (currentWallpaper + 1) % wallpapers.length;
    const video = document.getElementById('bg-video');
    if (video) {
        video.style.opacity = '0';
        video.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            video.querySelector('source').src = wallpapers[currentWallpaper];
            video.load();
            video.play();
            video.style.opacity = '1';
        }, 500);
    }
    showNotification(`🖼️ Wallpaper changed (${currentWallpaper + 1}/${wallpapers.length})`);
    closeAllMenus();
}

// ================= START MENU =================
function closeStartMenu() {
    if (startMenu) startMenu.classList.remove('active');
    if (startBtn) startBtn.classList.remove('active');
}

// ================= RIGHT-CLICK CONTEXT MENU =================
function initContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    if (!contextMenu) return;

    document.addEventListener('contextmenu', (e) => {
        // Only show on desktop background, not on windows/menus
        if (e.target.closest('.window') || e.target.closest('.taskbar') ||
            e.target.closest('.start-menu') || e.target.closest('.modal') ||
            e.target.closest('.dialog')) {
            return;
        }

        e.preventDefault();
        contextMenu.style.left = e.clientX + 'px';
        contextMenu.style.top = e.clientY + 'px';

        // Keep menu within viewport
        const rect = contextMenu.getBoundingClientRect();
        if (e.clientX + 180 > window.innerWidth) {
            contextMenu.style.left = (e.clientX - 180) + 'px';
        }
        if (e.clientY + rect.height > window.innerHeight - TASKBAR_HEIGHT) {
            contextMenu.style.top = (e.clientY - rect.height) + 'px';
        }

        contextMenu.classList.add('show');
    });

    document.addEventListener('click', () => {
        contextMenu.classList.remove('show');
    });
}

// ================= BSOD EASTER EGG =================
function triggerBSOD() {
    const bsod = document.getElementById('bsodScreen');
    if (!bsod) return;
    bsod.classList.add('active');

    const dismiss = () => {
        bsod.classList.remove('active');
        document.removeEventListener('keydown', dismiss);
        document.removeEventListener('click', dismiss);
    };

    // Auto-dismiss after 5 seconds or on keypress
    setTimeout(() => {
        document.addEventListener('keydown', dismiss);
        document.addEventListener('click', dismiss);
    }, 500);

    setTimeout(dismiss, 5000);
}

// ================= STATUS BAR =================
function initStatusBar() {
    const loadEl = document.getElementById('load-time');
    if (loadEl) {
        const loadTime = (Math.random() * 0.5 + 0.2).toFixed(2);
        loadEl.textContent = `Load: ${loadTime}s`;
    }
}

// ================= TERMINAL =================
function initTerminal() {
    const input = document.getElementById("cmdInput");
    const output = document.getElementById("cmdOutput");
    const cmdWindow = document.querySelector(".cmd-window");

    if (!input || !output || !cmdWindow) return;

    input.addEventListener("keydown", function (e) {
        // Command history navigation
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[commandHistory.length - 1 - historyIndex];
            }
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[commandHistory.length - 1 - historyIndex];
            } else {
                historyIndex = -1;
                input.value = '';
            }
            return;
        }

        if (e.key === "Enter") {
            let rawCommand = input.value.trim();
            let command = rawCommand.toLowerCase();

            // Show typed command
            if (rawCommand.length > 0) {
                output.innerHTML += `<span>C:\\Users\\Visitor> ${escapeHtml(rawCommand)}</span><br>`;
                commandHistory.push(rawCommand);
            } else {
                output.innerHTML += `<span>C:\\Users\\Visitor></span><br>`;
                input.value = "";
                return;
            }
            historyIndex = -1;

            // Process command
            processCommand(command, output);

            input.value = "";
            output.scrollTop = output.scrollHeight;
        }
    });

    cmdWindow.addEventListener("click", () => input.focus());
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function typeResponse(output, text, callback) {
    let i = 0;
    const span = document.createElement('span');
    output.appendChild(span);
    const interval = setInterval(() => {
        if (i < text.length) {
            if (text.substring(i, i + 4) === '<br>') {
                span.innerHTML += '<br>';
                i += 4;
            } else {
                span.innerHTML += escapeHtml(text[i]);
                i++;
            }
            output.scrollTop = output.scrollHeight;
        } else {
            clearInterval(interval);
            if (callback) callback();
        }
    }, 15);
}

function processCommand(command, output) {
    switch (command) {
        case "help":
            output.innerHTML += `<span class="cmd-highlight">Available commands:</span><br>`;
            output.innerHTML += `<br>`;
            output.innerHTML += `  <span class="cmd-info">about</span>      — Who am I?<br>`;
            output.innerHTML += `  <span class="cmd-info">skills</span>     — My tech stack<br>`;
            output.innerHTML += `  <span class="cmd-info">projects</span>   — View my projects<br>`;
            output.innerHTML += `  <span class="cmd-info">education</span>  — Academic background<br>`;
            output.innerHTML += `  <span class="cmd-info">contact</span>    — Get in touch<br>`;
            output.innerHTML += `  <span class="cmd-info">github</span>     — Open GitHub profile<br>`;
            output.innerHTML += `  <span class="cmd-info">linkedin</span>   — Open LinkedIn profile<br>`;
            output.innerHTML += `  <span class="cmd-info">resume</span>     — Download my resume<br>`;
            output.innerHTML += `  <span class="cmd-info">whoami</span>     — Find out<br>`;
            output.innerHTML += `  <span class="cmd-info">date</span>       — Current date & time<br>`;
            output.innerHTML += `  <span class="cmd-info">wallpaper</span>  — Change wallpaper<br>`;
            output.innerHTML += `  <span class="cmd-info">matrix</span>     — Enter the Matrix<br>`;
            output.innerHTML += `  <span class="cmd-info">bsod</span>       — Don't press this...<br>`;
            output.innerHTML += `  <span class="cmd-info">clear</span>      — Clear terminal<br>`;
            output.innerHTML += `  <span class="cmd-info">cls</span>        — Clear terminal<br>`;
            output.innerHTML += `<br>`;
            break;

        case "about":
            output.innerHTML += `<br>`;
            output.innerHTML += `<span class="cmd-ascii">  ╔══════════════════════════════════════╗</span><br>`;
            output.innerHTML += `<span class="cmd-ascii">  ║</span>  <span class="cmd-highlight">SWAROM FIRAGANNAVAR</span>               <span class="cmd-ascii">║</span><br>`;
            output.innerHTML += `<span class="cmd-ascii">  ║</span>  Computer Engineering Student       <span class="cmd-ascii">║</span><br>`;
            output.innerHTML += `<span class="cmd-ascii">  ║</span>  MIT-ADT University, Pune           <span class="cmd-ascii">║</span><br>`;
            output.innerHTML += `<span class="cmd-ascii">  ║</span>                                     <span class="cmd-ascii">║</span><br>`;
            output.innerHTML += `<span class="cmd-ascii">  ║</span>  Aspiring Software Engineer who     <span class="cmd-ascii">║</span><br>`;
            output.innerHTML += `<span class="cmd-ascii">  ║</span>  loves building things that solve   <span class="cmd-ascii">║</span><br>`;
            output.innerHTML += `<span class="cmd-ascii">  ║</span>  real world problems.               <span class="cmd-ascii">║</span><br>`;
            output.innerHTML += `<span class="cmd-ascii">  ╚══════════════════════════════════════╝</span><br>`;
            output.innerHTML += `<br>`;
            break;

        case "skills":
            output.innerHTML += `<br>`;
            output.innerHTML += `<span class="cmd-highlight"> LOADED MODULES:</span><br><br>`;
            output.innerHTML += `  <span class="cmd-info">Languages:</span>      Python · Java · JavaScript (ES6+) · SQL<br>`;
            output.innerHTML += `  <span class="cmd-info">AI / ML:</span>        TensorFlow/Keras · Grad-CAM/XAI · GenAI · Computer Vision<br>`;
            output.innerHTML += `  <span class="cmd-info">Web Dev:</span>        FastAPI · HTML5/CSS3 · Firebase · REST APIs<br>`;
            output.innerHTML += `  <span class="cmd-info">Core Concepts:</span>  DSA · OOP · REST APIs · Async/Await<br>`;
            output.innerHTML += `  <span class="cmd-info">Tools:</span>          Git/GitHub · Postman · Gemini API · Hugging Face · VS Code · AWS<br>`;
            output.innerHTML += `<br>`;
            break;

        case "projects":
            output.innerHTML += `<br>`;
            output.innerHTML += `<span class="cmd-highlight"> PROJECT DIRECTORY:</span><br><br>`;
            output.innerHTML += `  <span class="cmd-info">[1]</span> 🌿 Foliage Care — AI Plant Pathologist<br>`;
            output.innerHTML += `      Python · FastAPI · TensorFlow · Gemini 2.5-Flash · Pix2Pix · Firebase · Chart.js<br>`;
            output.innerHTML += `      Accuracy: <span class="cmd-success">99.27%</span> | 38 disease categories | XAI Grad-CAM | ~500ms latency<br><br>`;
            output.innerHTML += `  <span class="cmd-info">[2]</span> 🚕 Cab Booking System<br>`;
            output.innerHTML += `      HTML | CSS | JavaScript<br>`;
            output.innerHTML += `      Optimized dispatch platform with real-time tracking & dynamic pricing metrics<br><br>`;
            output.innerHTML += `  <span class="cmd-info">[3]</span> 📚 Term Track System<br>`;
            output.innerHTML += `      HTML | CSS | JavaScript | MySQL<br>`;
            output.innerHTML += `      High-concurrency relational filtering with academic API integration & caching<br>`;
            output.innerHTML += `<br>`;
            break;

        case "education":
            output.innerHTML += `<br>`;
            output.innerHTML += `<span class="cmd-highlight"> EDUCATION TIMELINE:</span><br><br>`;
            output.innerHTML += `  <span class="cmd-info">2022-2026</span>  B.Tech CSE<br>`;
            output.innerHTML += `             MIT-ADT University, Pune<br>`;
            output.innerHTML += `             CGPA: 7.78<br><br>`;
            output.innerHTML += `  <span class="cmd-info">2022</span>       Class 12 - The Lexicon International School<br>`;
            output.innerHTML += `             Score: 75%<br><br>`;
            output.innerHTML += `  <span class="cmd-info">2020</span>       Class 10 - The Lexicon International School<br>`;
            output.innerHTML += `             Score: 87% (Distinction)<br>`;
            output.innerHTML += `<br>`;
            break;

        case "contact":
            output.innerHTML += `<br>`;
            output.innerHTML += `<span class="cmd-highlight"> CONTACT INFO:</span><br><br>`;
            output.innerHTML += `  📧 Email:    <span class="cmd-info">swarom66@gmail.com</span><br>`;
            output.innerHTML += `  🌐 GitHub:   <span class="cmd-info">github.com/SlanderDome</span><br>`;
            output.innerHTML += `  💼 LinkedIn:  <span class="cmd-info">linkedin.com/in/your-linkedin</span><br><br>`;
            output.innerHTML += `  <span class="cmd-success">STATUS: Ready to work. Hire me!</span><br>`;
            output.innerHTML += `<br>`;
            break;

        case "github":
            output.innerHTML += `<span class="cmd-info"> Opening GitHub...</span><br><br>`;
            window.open('https://github.com/SlanderDome', '_blank');
            break;

        case "linkedin":
            output.innerHTML += `<span class="cmd-info"> Opening LinkedIn...</span><br><br>`;
            window.open('https://linkedin.com/in/your-linkedin', '_blank');
            break;

        case "resume":
            output.innerHTML += `<span class="cmd-success"> Downloading resume...</span><br><br>`;
            downloadResume();
            break;

        case "whoami":
            output.innerHTML += `<br>`;
            output.innerHTML += `<span class="cmd-highlight"> You are: Visitor</span><br>`;
            output.innerHTML += `<span> But the real question is...</span><br>`;
            output.innerHTML += `<span> Are you a recruiter? 👀</span><br>`;
            output.innerHTML += `<br>`;
            break;

        case "date":
            const now = new Date();
            output.innerHTML += `<br>`;
            output.innerHTML += `<span> Current Date: <span class="cmd-info">${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></span><br>`;
            output.innerHTML += `<span> Current Time: <span class="cmd-info">${now.toLocaleTimeString()}</span></span><br>`;
            output.innerHTML += `<br>`;
            break;

        case "wallpaper":
            output.innerHTML += `<span class="cmd-info"> Changing wallpaper...</span><br><br>`;
            cycleWallpaper();
            break;

        case "matrix":
            output.innerHTML += `<span class="cmd-success"> Entering the Matrix...</span><br>`;
            runMatrixEffect(output);
            break;

        case "bsod":
            output.innerHTML += `<span class="cmd-error"> FATAL ERROR: Too much talent detected!</span><br>`;
            setTimeout(triggerBSOD, 500);
            break;

        case "clear":
        case "cls":
            output.innerHTML = `<span>PortfolioOS [Version 10.0.2026]</span><br>`;
            output.innerHTML += `<span>(c) Swarom Firagannavar. All rights reserved.</span><br><br>`;
            break;

        case "sudo hire me":
        case "hire":
            output.innerHTML += `<br>`;
            output.innerHTML += `<span class="cmd-success"> ✅ HIRE_REQUEST sent successfully!</span><br>`;
            output.innerHTML += `<span> Check email: swarom66@gmail.com</span><br>`;
            output.innerHTML += `<br>`;
            break;

        case "exit":
            output.innerHTML += `<span class="cmd-error"> Nice try! You can't escape this portfolio. 😄</span><br><br>`;
            break;

        default:
            output.innerHTML += `<span class="cmd-error">'${escapeHtml(command)}' is not recognized as an internal or external command.</span><br>`;
            output.innerHTML += `<span>Type '<span class="cmd-highlight">help</span>' for available commands.</span><br><br>`;
    }
}

// ================= MATRIX EASTER EGG =================
function runMatrixEffect(output) {
    const chars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01";
    let lines = 0;
    const maxLines = 15;

    const interval = setInterval(() => {
        let line = '';
        for (let i = 0; i < 50; i++) {
            line += chars[Math.floor(Math.random() * chars.length)];
        }
        output.innerHTML += `<span class="cmd-success">${line}</span><br>`;
        output.scrollTop = output.scrollHeight;
        lines++;
        if (lines >= maxLines) {
            clearInterval(interval);
            output.innerHTML += `<br><span class="cmd-highlight"> Wake up, Visitor...</span><br>`;
            output.innerHTML += `<span class="cmd-highlight"> The Matrix has you...</span><br><br>`;
            output.scrollTop = output.scrollHeight;
        }
    }, 100);
}

// ================= SHUTDOWN DIALOG =================
function showShutdownDialog() {
    const modal = document.getElementById('shutdownModal');
    if (modal) modal.classList.add('active');
    closeStartMenu();
}

function closeShutdown() {
    const modal = document.getElementById('shutdownModal');
    if (modal) modal.classList.remove('active');
}

function performShutdown() {
    const selected = document.querySelector('input[name="shutdown"]:checked');
    const action = selected ? selected.parentElement.textContent.trim() : "Shutdown";

    closeShutdown();

    if (action.includes('Restart') || action.includes('restart')) {
        // Fun restart animation
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '0';
        setTimeout(() => location.reload(), 600);
    } else {
        showNotification("💡 Just kidding! This is a portfolio website 😄");
    }
}

// ================= MAIN INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM references
    win = document.getElementById('mainWindow');
    taskbarItem = document.getElementById('taskbarItem');
    startBtn = document.getElementById('startBtn');
    startMenu = document.getElementById('startMenu');

    // Run boot sequence
    runBootSequence();

    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Status bar
    initStatusBar();

    // Make window draggable
    if (win) makeDraggable(win);

    // Button wiring
    const minBtn = document.querySelector('[aria-label="Minimize"]');
    const maxBtn = document.querySelector('[aria-label="Maximize"]');
    const closeBtn = document.querySelector('[aria-label="Close"]');

    if (minBtn) minBtn.addEventListener('click', minimizeWindow);
    if (maxBtn) maxBtn.addEventListener('click', toggleMaximize);
    if (closeBtn) closeBtn.addEventListener('click', showCloseDialog);

    // Start Button
    if (startBtn && startMenu) {
        startBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            startMenu.classList.toggle('active');
            startBtn.classList.toggle('active');
        });
    }

    // Close menus on outside click
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.menu-item')) closeAllMenus();
        if (startMenu && startBtn && !startMenu.contains(e.target) && !startBtn.contains(e.target)) {
            closeStartMenu();
        }
    });

    // Terminal
    initTerminal();

    // Context menu
    initContextMenu();

    // Desktop icon selection
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
        icon.addEventListener('click', function (e) {
            icons.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Deselect icons on desktop click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.desktop-icon')) {
            icons.forEach(i => i.classList.remove('selected'));
        }
    });

    // Double-click title bar to maximize
    const titleBar = win ? win.querySelector('.title-bar') : null;
    if (titleBar) {
        titleBar.addEventListener('dblclick', toggleMaximize);
    }
});