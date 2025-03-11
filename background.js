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

            else if (request.action === "break") {}
        });
        return true;
    }
);