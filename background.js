let timer = null; // moved to this file because this file is persistent
let countDown_Timer = null;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        chrome.storage.local.get(["startTime", "elapsedTime", "isRunning", "countDownTime", "isCountingDown"], (data) => {

            if (request.action === "start") {
                if (!data.isRunning) {
                    const newStartTime = Date.now() - (data.elapsedTime || 0);

                    chrome.storage.local.set({
                        startTime: newStartTime,
                        elapsedTime: data.elapsedTime || 0,
                        isRunning: true
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

                    chrome.storage.local.set({
                        elapsedTime: newElapsedTime,
                        isRunning: false
                    });
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
                    countDownTime: 0
                })
                sendResponse({ success: true });
            }

            else if (request.action === "break") {
                console.log("Break function triggered");

                let newElapsedTime = 0

                if (data.isRunning) {
                    console.log("Stopping main timer...");

                    clearInterval(timer);
                    newElapsedTime = Date.now() - data.startTime;
                    
                    chrome.storage.local.set({
                        elapsedTime: newElapsedTime,
                        isRunning: false
                    });
                }

                let breakTime = newElapsedTime / 3;
                console.log("Initial breakTime:", breakTime);

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
                        console.log("Break Timer ticking:", breakTime);

                        if (breakTime <= 0) {
                            clearInterval(countDown_Timer);

                            chrome.storage.local.set({ 
                                isCountingDown: false, 
                                countDownTime: 0 
                            });
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