let startTime = 0;
let elapsedTime = 0;
let countDownTime = 0;

let isRunning = false;
let timer = null;
let countDown_Timer = null;
let isCountingDown = false;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (message.action === "start") {
            chrome.storage.local.get(["startTime", "elapsedTime", "isRunning", "timer"], (data) => {
                if (!data.isRunning) {
                    data.startTime = Date.now() - data.elapsedTime;
                    data.timer = setInterval(update, 10);
                    data.isRunning = true;
                }
            });
            return true;
        }
        else if (message.action === "stop") {
            return true;
        }
        else if (message.action === "reset") {
            return true;
        } 
        else if (message.action === "break") {
            return true;
        }
    }
)