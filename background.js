let currentTabId = 0;
let allTabs = [];

function sendMessageToUI(message, data) {
    const messageObject = {
        name: message,
        params: data
    };

    browser.runtime.sendMessage(messageObject);
}

function setCurrentTabId(tabId) {
    currentTabId = tabId;

    // send message to UI
    sendMessageToUI('currentTabId', tabId);
}

function subscribeToTabUpdates() {
    // listen for new tabs
    browser.tabs.onCreated.addListener((tab) => {
        browser.windows.get(tab.windowId)
            .then((window) => {
                allTabs.push({id: tab.id, url: tab.url});
                if (tab.active
                    && window.focused === true) {
                    // set as current tab
                    setCurrentTabId(tab.id);

                    // send message to UI
                    sendMessageToUI('allTabs', allTabs);
                }
            });
    });

    // listen for url update
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'loading') {
            // update tab value in array
            const tabIndex = allTabs.findIndex(t => t.id === tabId);
            allTabs[tabIndex] = {id: tabId, url: tab.url};

            // send message to UI
            sendMessageToUI('allTabs', allTabs);
        }
    });

    // listen for close
    browser.tabs.onRemoved.addListener((tabId) => {
        // remove tab in array
        const tabIndex = allTabs.findIndex(t => t.id === tabId);
        allTabs.splice(tabIndex, 1);

        // send message to UI
        sendMessageToUI('allTabs', allTabs);
    });

    // listen for tab selection
    browser.tabs.onActivated.addListener((activeInfo) => {
        // set as current tab
        setCurrentTabId(activeInfo.tabId);
    });
}

function getAllWindows() {
    browser.windows.getAll({populate: true})
        .then((windows) => {
            getAllTabs(windows);
        });
}

function getAllTabs(windows) {
    const length = windows.length;
    for (let i = 0; i < length; i++) {
        const window = windows[i];
        const length2 = window.tabs.length;
        for (let j = 0; j < length2; j++) {
            const tab = window.tabs[j];
            allTabs.push({id: tab.id, url: tab.url});
            if (tab.active
                && window.focused === true) {
                setCurrentTabId(tab.id);
            }
        }
    }

    // send message to UI
    sendMessageToUI('allTabs', allTabs);
}

function closeTab(tabId, delay = 0) {
    browser.tabs.remove(tabId);
}

function createNewTab(url, active = true) {
    browser.tabs.create({url, active})
}

function receivedMessage(receivedMessage, sender, sendResponse) {
    if (receivedMessage.name === 'createTab') {
        createNewTab('https://fr.igraal.com', true);
    }
    else if (receivedMessage.name === 'removeTab') {
        closeTab(allTabs[allTabs.length - 1].id);
    }
    else if (receivedMessage.name === 'fetchTabs') {
        sendMessageToUI('currentTabId', currentTabId);
        sendMessageToUI('allTabs', allTabs);
    }

    if (sendResponse !== undefined) {
        sendResponse({data: undefined});
    }
}

browser.runtime.onMessage.addListener(receivedMessage.bind(this));
getAllWindows();
subscribeToTabUpdates();
