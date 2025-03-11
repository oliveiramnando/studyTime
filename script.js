document.addEventListener("DOMContentLoaded", () => {  // Document Object Model Manipulation

    const display = document.getElementById("display");
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const resetBtn = document.getElementById("resetBtn");
    const break_button = document.getElementById("breakBtn");

    let startTime = 0;
    let elapsedTime = 0;
    let isRunning = false;

    let countDownTime = 0;
    let isCountingDown = false;

    function start() {
        chrome.runtime.sendMessage({ action: "start"});
    }

    function stop() {
        chrome.runtime.sendMessage({ action: "stop"});
    }

    function reset() {
        chrome.runtime.sendMessage({ action: "reset"});
        display.textContent = "00:00:00.00"
    }

    function breakBtn() {
        chrome.runtime.sendMessage({ action: "break"});
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
                // chrome.storage.local.set({ isCountingDown: false });
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

    chrome.storage.local.get(["display"], (data) => {   // checks display when popup opens
        if (data.display) {
            // console.log("Popup opened, setting display:", data.display);
            display.textContent = data.display;
        }
    });

    chrome.storage.onChanged.addListener((changes) => {     // listens for storage changes; updates display
        if (changes.elapsedTime) update();
        if (changes.countDownTime) updateCountDown();
        if (changes.display) {
            // console.log("Display updated:", changes.display.newValue);
            display.textContent = changes.display.newValue;  
        }
    })

    startBtn.addEventListener("click", start); 
    stopBtn.addEventListener("click", stop);
    resetBtn.addEventListener("click", reset);
    break_button.addEventListener("click", breakBtn);
});