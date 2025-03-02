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

    let countDownTimer = null;
    let countDownTime = 0;

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
        clearInterval(countDownTimer);
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

            let breakMinutes = Math.floor((elapsedTime / (1000 * 60)) / 3);

            if (breakMinutes > 15) {
                breakMinutes = 15;
            }

            countDownTime = breakMinutes * 60;

            if (countDownTime > 0) {
                startCountDown();
            }

        }
    } 

    function startCountDown() {
        clearInterval(countDownTimer);
        countDownTimer = setInterval(() => {
            if (countDownTime <= 0) {
                clearInterval(countDownTimer);
                display.textContent = "BreakOver!";
                return;
            }
            updateCountDown(countDownTime);
            countDownTime--;
        }, 1000);
    }

    function updateCountDown(countDown) {
        let minutes = Math.floor(countDown / (1000 * 60) % 60);
        let seconds = Math.floor(countDown / 1000 % 60);

        minutes = String(minutes).padStart(2, "0");
        seconds = String(seconds).padStart(2, "0");

        display.textContent = `${minutes}:${seconds}`;

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

    startBtn.addEventListener("click", start);
    stopBtn.addEventListener("click", stop);
    resetBtn.addEventListener("click", reset);
    break_button.addEventListener("click", breakBtn);
});