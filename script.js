document.addEventListener("DOMContentLoaded", () => { 

    const display = document.getElementById("display");

    const startStopBtn = document.getElementById('startStopBtn')

    const resetBtn = document.getElementById("resetBtn");
    const break_button = document.getElementById("breakBtn");

    const currentStreak = document.getElementById("current-streak-message");
    const bestStreak = document.getElementById("best-streak-message");

    let startTime = 0;
    let elapsedTime = 0;
    let isRunning = false;

    let countDownTime = 0;
    let isCountingDown = false;

    function updateButtonState(isRunning) {
        if (isRunning) {
            startStopBtn.textContent = "Stop";
            startStopBtn.classList.add("active");
        } else {
            startStopBtn.textContent = "Start";
            startStopBtn.classList.remove("active");
        }
    }

    function startStop () {
        chrome.storage.local.get(["isRunning"], (data) => {
            if (!data.isRunning) {
                chrome.runtime.sendMessage({ action: "start"});
                updateButtonState(true);
            } 
            if (data.isRunning) {
                chrome.runtime.sendMessage({ action: "stop"});
                updateButtonState(false);
            }
        })
    }

    function reset() {
        chrome.runtime.sendMessage({ action: "reset"});
        display.textContent = "00:00:00.00"
        updateButtonState(false);
    }

    function breakBtn() {
        chrome.runtime.sendMessage({ action: "break"});
        updateButtonState(false);
    } 

    function update() {
        chrome.storage.local.get(["elapsedTime"], (data) => {
            const newElapsedTime = data.elapsedTime

            let hours = Math.floor(newElapsedTime / (1000 * 60 * 60));
            let minutes = Math.floor(newElapsedTime / (1000 * 60) % 60);
            let seconds = Math.floor(newElapsedTime / 1000 % 60);
            let milliseconds = Math.floor(newElapsedTime % 1000 / 10);

            hours = String(hours).padStart(2, "0");
            minutes = String(minutes).padStart(2, "0");
            seconds = String(seconds).padStart(2, "0");
            milliseconds = String(milliseconds).padStart(2, "0");

            display.textContent = `${hours}:${minutes}:${seconds}.${milliseconds}`;
        });
    }

    function updateCountDown() {
        chrome.storage.local.get(["countDownTime"], (data) => {
            let remainingTime = data.countDownTime || 0;

            if (remainingTime <= 0) {
                display.textContent = "Break Over!";
                return;
            }
    
            let minutes = Math.floor(remainingTime / (1000 * 60) % 60);
            let seconds = Math.floor(remainingTime / 1000 % 60);
            let milliseconds = Math.floor(remainingTime % 1000 / 10);
    
            minutes = String(minutes).padStart(2, "0");
            seconds = String(seconds).padStart(2, "0");
            milliseconds = String(milliseconds).padStart(2, "0");
    
            display.textContent = `${minutes}:${seconds}.${milliseconds}`;
        })
    }

    function updateStreakDisplay() {
        chrome.storage.local.get(["currentStreak", "bestStreak"], (data) => {
            currentStreak.textContent = `Current Streak: ${data.currentStreak}`;
            bestStreak.textContent = `Best Streak: ${data.bestStreak}`;
        });
    }

    chrome.storage.local.get(["display"], (data) => {   // checks display when popup opens
        if (data.display) {
            display.textContent = data.display;
        }
    });

    chrome.storage.local.get(["currentStreak", "bestStreak"], (data) => {   // checks streak when popup opens
        if (data.currentStreak || data.bestStreak) {
            currentStreak.textContent = `Current Streak: ${data.currentStreak}`;
            bestStreak.textContent = `Best Streak: ${data.bestStreak}`;
        }
    });

    chrome.storage.local.get(["isRunning"], (data) => {
        updateButtonState(data.isRunning);
    });


    chrome.storage.onChanged.addListener((changes) => {     // listens for storage changes; updates display
        if (changes.elapsedTime) update();
        if (changes.countDownTime) updateCountDown();
        if (changes.display) {
            display.textContent = changes.display.newValue;  
        }
        if (changes.currentStreak || changes.bestStreak) {
            updateStreakDisplay();
        }
    })

    startStopBtn.addEventListener("click", startStop); 
    resetBtn.addEventListener("click", reset);
    break_button.addEventListener("click", breakBtn);
});