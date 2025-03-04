document.addEventListener("DOMContentLoaded", () => {
    const display = document.getElementById("display");
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const resetBtn = document.getElementById("resetBtn");
    const break_button = document.getElementById("breakBtn");

    let timer = null;
    let startTime = 0;
    let elapsedTime = 0;
    let isRunning = false;

    let countDown_Timer = null;
    let countDownTime = 0;
    let isCountingDown = false;

    function start() {
        if (!isRunning) {
            startTime = Date.now() - elapsedTime;
            timer = setInterval(update, 10);
            isRunning = true;
        }
    }

    function stop() {
        if (isRunning) {
            clearInterval(timer);
            elapsedTime = Date.now() - startTime;
            isRunning = false;
        }
    }

    function reset() {
        clearInterval(timer);
        clearInterval(countDown_Timer);
        startTime = 0;
        elapsedTime = 0;
        isRunning = false;
        countDownTime = 0;
        display.textContent = "00:00:00.00";
    }

    function breakBtn() {
        if (isRunning) {
            clearInterval(timer);
            elapsedTime = Date.now() - startTime;
            isRunning = false;
        }

        countDownTime = elapsedTime / 3;

        if (Math.floor(countDownTime / (1000 * 60) % 60) > 15) { // if the third of the time is greater than 15 minutes then...
            countDownTime = 15 * 60 * 1000;
        }

        if (countDownTime > 0) {
            clearInterval(countDown_Timer);
            countDown_Timer = setInterval(updateCountDown, 10);
            isCountingDown = true;
        }

        elapsedTime = 0;
        startTime = 0;
    } 

    function update() {
        const currentTime = Date.now();
        elapsedTime = currentTime - startTime;

        let hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        let minutes = Math.floor(elapsedTime / (1000 * 60) % 60);
        let seconds = Math.floor(elapsedTime / 1000 % 60);
        let milliseconds = Math.floor(elapsedTime % 1000 / 10);

        hours = String(hours).padStart(2, "0");
        minutes = String(minutes).padStart(2, "0");
        seconds = String(seconds).padStart(2, "0");
        milliseconds = String(milliseconds).padStart(2, "0");

        display.textContent = `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }

    function updateCountDown() {
 
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

        display.textContent = `${minutes}:${seconds}.${milliseconds}`;
    }

    startBtn.addEventListener("click", start); 
    stopBtn.addEventListener("click", stop);
    resetBtn.addEventListener("click", reset);
    break_button.addEventListener("click", breakBtn);
});