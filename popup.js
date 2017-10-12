
function sendMessageToBackground(message, data = null) {
    const messageObject = {
        name: message,
        params: data
    };

    browser.runtime.sendMessage(messageObject);
}

function receivedMessage(receivedMessage, sender, sendResponse) {
    if (receivedMessage.params === undefined) {
        return;
    }

    if (receivedMessage.name === 'currentTabId') {
        let currentTabId = document.getElementById('currentTabId');
        currentTabId.innerHTML = receivedMessage.params;
    }
    else if (receivedMessage.name === 'allTabs') {
        const allTabs = receivedMessage.params;
        let allTabsList = document.getElementById('allTabsList');
        allTabsList.innerHTML = '';
        for (let i = 0; i < allTabs.length; i +=1) {
            let tabElement = document.createElement('LI');
            let tabUrlElement = document.createElement('A');
            tabUrlElement.href = allTabs[i].url;
            tabUrlElement.text = allTabs[i].url;
            let textnode = document.createTextNode(`${allTabs[i].id}: `);
            tabElement.appendChild(textnode);
            tabElement.appendChild(tabUrlElement);
            allTabsList.appendChild(tabElement);
        }
    }
}

function initButtons() {
    let createTabButton = document.getElementById('createTabButton');
    let removeTabButton = document.getElementById('removeTabButton');
    createTabButton.onclick = () => {
        sendMessageToBackground('createTab');
    };
    removeTabButton.onclick = () => {
        sendMessageToBackground('removeTab');
    };
}

browser.runtime.onMessage.addListener(receivedMessage.bind(this));
initButtons();
sendMessageToBackground('fetchTabs');
