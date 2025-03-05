let startTime = null;
let elapsedTime = 0;
let isRunning = false;
let intervalId = null;
let breakEndTime = null;
let isOnBreak = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "start") {
        chrome.storage.local.get(["startTime", "elapsedTime", "isRunning", "isOnBreak"], (data) => {
            if (!data.isRunning && !data.isOnBreak) {
                startTime = Date.now() - (data.elapsedTime || 0);
                elapsedTime = data.elapsedTime || 0;
                isRunning = true;
                isOnBreak = false;

                intervalId = setInterval(() => {
                    elapsedTime = Date.now() - startTime;
                    chrome.storage.local.set({ startTime, elapsedTime, isRunning: true, isOnBreak: false });
                }, 10);

                chrome.storage.local.set({ startTime, isRunning: true });
            }
            sendResponse({ elapsedTime });
        });
        return true;
    } 
    
    else if (message.action === "stop") {
        if (isRunning) {
            clearInterval(intervalId);
            elapsedTime = Date.now() - startTime;
            isRunning = false;
            chrome.storage.local.set({ elapsedTime, isRunning: false });
        }
        sendResponse({ elapsedTime });
        return true;
    } 
    
    else if (message.action === "reset") {
        clearInterval(intervalId);
        startTime = 0;
        elapsedTime = 0;
        isRunning = false;
        isOnBreak = false;

        chrome.storage.local.set({ startTime: 0, elapsedTime: 0, isRunning: false, isOnBreak: false });
        sendResponse({ elapsedTime: 0 });
        return true;
    } 
    
    else if (message.action === "break") {
        if (isRunning) {
            clearInterval(intervalId);
            elapsedTime = Date.now() - startTime;
            isRunning = false;
            chrome.storage.local.set({ elapsedTime, isRunning: false });
            startTime = 0;
        }

        let breakDuration = elapsedTime / 3;
        if (Math.floor(breakDuration / (1000 * 60) % 60) > 15) {
            breakDuration = 15 * 60 * 1000;
        }

        if (breakDuration > 0) {
            breakEndTime = Date.now() + breakDuration;
            isOnBreak = true;

            const breakInterval = setInterval(() => {
                const timeLeft = breakEndTime - Date.now();
                if (timeLeft <= 0) {
                    clearInterval(breakInterval);
                    isOnBreak = false;
                    chrome.storage.local.set({ breakEndTime: null, isOnBreak: false });
                }
            }, 10);

            chrome.storage.local.set({ breakEndTime, isOnBreak: true });
        }

        sendResponse({ elapsedTime: breakDuration, isOnBreak: true });
        return true;
    } 
    
    else if (message.action === "getElapsedTime") {
        chrome.storage.local.get(["startTime", "elapsedTime", "isRunning", "isOnBreak", "breakEndTime"], (data) => {
            let currentElapsedTime = data.elapsedTime || 0;

            if (data.startTime && data.isRunning) {
                currentElapsedTime = Date.now() - data.startTime;
            }

            if (data.isOnBreak && data.breakEndTime) {
                let breakTimeLeft = data.breakEndTime - Date.now();
                if (breakTimeLeft <= 0) {
                    isOnBreak = false;
                    chrome.storage.local.set({ isOnBreak: false });
                }
                sendResponse({ elapsedTime: breakTimeLeft, isOnBreak: true });
                return true;
            }

            sendResponse({ elapsedTime: currentElapsedTime, isOnBreak: false });
        });
        return true;
    }
});
