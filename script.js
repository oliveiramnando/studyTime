document.addEventListener("DOMContentLoaded", () => {
    const display = document.getElementById("display");
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const resetBtn = document.getElementById("resetBtn");
    const breakBtn = document.getElementById("breakBtn"); 

    let intervalId = null;

    function updateDisplay(elapsedTime, isOnBreak = false) {
        let hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        let minutes = Math.floor(elapsedTime / (1000 * 60) % 60);
        let seconds = Math.floor(elapsedTime / 1000 % 60);
        let milliseconds = Math.floor(elapsedTime % 1000 / 10);

        hours = String(hours).padStart(2,"0");
        minutes = String(minutes).padStart(2, "0");
        seconds = String(seconds).padStart(2, "0");
        milliseconds = String(milliseconds).padStart(2, "0");

        if (isOnBreak == true) {
            updateCountDown(elapsedTime)
        }

        display.textContent = `${hours}:${minutes}:${seconds}.${milliseconds}`;


    }

    function updateCountDown(countDownTime, isBreak = true) {
        
        countDownTime -= 10;

        if (countDownTime <= 0) {
            clearInterval(countDown_Timer);
            isCountingDown = false;
            display.textContent = "Break Over!";
            return;
        }

        let minutes = Math.floor(countDownTime / (1000 * 60) % 60);
        let seconds = Math.floor(countDownTime / 1000 % 60);
        let milliseconds = Math.floor(countDownTime % 1000 / 10);

        minutes = String(minutes).padStart(2, "0");
        seconds = String(seconds).padStart(2, "0");
        milliseconds = String(milliseconds).padStart(2, "0");

        display.textContent = `Break: ${minutes}:${seconds}.${milliseconds}`;
    }

    function requestElapsedTime() {
        chrome.runtime.sendMessage({ action: "getElapsedTime" }, (response) => {
            if (response) {
                updateDisplay(response.elapsedTime, response.isOnBreak);
            }
        });
    }

    startBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "start" });
        if (!intervalId) {
            intervalId = setInterval(requestElapsedTime, 10);
        }
    });

    stopBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "stop" });
        clearInterval(intervalId);
        intervalId = null;
    });

    resetBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "reset" });
        clearInterval(intervalId);
        intervalId = null;
        updateDisplay(0);
    });

    breakBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "break" });
        clearInterval(intervalId);
        intervalId = setInterval(requestElapsedTime, 10);
    });

    requestElapsedTime();
    intervalId = setInterval(requestElapsedTime, 10);

    window.addEventListener("unload", () => {
        clearInterval(intervalId);
    });
});
