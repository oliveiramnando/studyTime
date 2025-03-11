let timer = null; // moved to this file because this file is persistent
let countDown_Timer = null;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        chrome.storage.local.get(["startTime", "elapsedTime", "isRunning", "countDownTime", "isCountingDown", "display"], (data) => {

            if (request.action === "start") {
                if (!data.isRunning) {
                    const newStartTime = Date.now() - (data.elapsedTime || 0);

                    chrome.storage.local.set({
                        startTime: newStartTime,
                        elapsedTime: data.elapsedTime || 0,
                        isRunning: true,
                        isCountingDown: false
                    });

                    if (timer) clearInterval(timer); // Stops any existing interval

                    timer = setInterval(() => {
                        chrome.storage.local.get(["startTime"], (updatedData) => {
                            if (!updatedData.startTime) return;
                            const currentTime = Date.now();
                            const elapsedTime = currentTime - updatedData.startTime;
                            chrome.storage.local.set({ elapsedTime });
                        });
                    }, 10);
                }
                sendResponse({ success: true });
            }

            else if (request.action === "stop") {
                if (data.isRunning) {

                    clearInterval(timer);
                    const newElapsedTime = Date.now() - data.startTime;

                    let formattedTime = formatTime(newElapsedTime);

                    chrome.storage.local.set({
                        elapsedTime: newElapsedTime,
                        isRunning: false,
                        display: formattedTime 
                    });

                    update()

                }
                sendResponse({ success: true });
            }

            else if (request.action === "reset") {
                clearInterval(timer);
                clearInterval(countDown_Timer);
                
                chrome.storage.local.set({
                    startTime: 0,
                    elapsedTime: 0,
                    isRunning: false,
                    isCountingDown: false,
                    countDownTime: 0,
                    display: "00:00:00.00"
                })
                sendResponse({ success: true });
            }

            else if (request.action === "break") {
                let newElapsedTime = 0

                if (data.isRunning) {
                    clearInterval(timer);
                    newElapsedTime = Date.now() - data.startTime;
                    
                    chrome.storage.local.set({
                        elapsedTime: newElapsedTime,
                        isRunning: false
                    });
                } 
                if(!data.isRunning) {
                    newElapsedTime = data.elapsedTime;
                }

                let breakTime = newElapsedTime / 3;

                if (Math.floor(breakTime / (1000 * 60) % 60) > 15) { // if the third of the time is greater than 15 minutes then...
                    breakTime = 15 * 60 * 1000;                     // sets to 15 minutes (in ms)
                }

                chrome.storage.local.set({
                    countDownTime: breakTime,
                    isCountingDown: true
                })

                sendResponse({ success: true });

                if (countDown_Timer) clearInterval(countDown_Timer);

                countDown_Timer = setInterval(() => {
                    chrome.storage.local.get(["countDownTime"], (updatedData) => {

                        breakTime -= 10;
  
                        if (breakTime <= 0) {
                            clearInterval(countDown_Timer);

                            chrome.storage.local.set({ 
                                isCountingDown: false, 
                                countDownTime: 0,
                                display: "Break Over!"
                            });

                            notification();

                        } else {
                            chrome.storage.local.set({ countDownTime: breakTime });
                        }
                    });
                }, 10);

                chrome.storage.local.set({
                    elapsedTime: 0,
                    startTime: 0
                });
            }
        });
        return true;
    }
);

function notification() {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "/timer.png",
        title: "StudyTime",
        message: "Break Over!"
    }, (notificationId) => {
        console.log("Notification Created:", notificationId);
    });
}

function formatTime(timeToBeFormatted) {
    let hours = Math.floor(timeToBeFormatted / (1000 * 60 * 60));
    let minutes = Math.floor(timeToBeFormatted / (1000 * 60) % 60);
    let seconds = Math.floor(timeToBeFormatted / 1000 % 60);
    let milliseconds = Math.floor(timeToBeFormatted % 1000 / 10);

    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");
    milliseconds = String(milliseconds).padStart(2, "0");

    let formattedTime = `${hours}:${minutes}:${seconds}.${milliseconds}`;
    return formattedTime;
}