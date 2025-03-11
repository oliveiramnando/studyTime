
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        chrome.storage.local.get(["timer", "startTime", "elapsedTime", "isRunning", "countDown_Timer", "countDownTime", "isCountingDown"], (data) => {

            if (request.action === "start") {
                if (!data.isRunning) {
                    const newStartTime = Date.now() - (data.elapsedTime || 0);

                    chrome.storage.local.set({
                        startTime: newStartTime,
                        elapsedTime: data.elapsedTime || 0,
                        isRunning: true
                    });

                    const newTimer = setInterval(() => {
                        chrome.storage.local.get(["startTime"], (updatedData) => {
                            if (!updatedData.startTime) return;
                            const currentTime = Date.now();
                            const elapsedTime = currentTime - updatedData.startTime;
                            chrome.storage.local.set({ elapsedTime });
                        });
                    }, 10);

                    chrome.storage.local.set({ timerId: newTimer });
                }
                sendResponse({ success: true });
            }

            else if (request.action === "stop") {}
            else if (request.action === "reset") {}
            else if (request.action === "break") {}
        });
        return true;
    }
);