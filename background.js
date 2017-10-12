let currentTabId = 0;
let allTabs = [];


function setCurrentTabId(tabId) {
    currentTabId = tabId;
}

function subscribeToTabUpdates() {
    // listen for new tabs
    browser.tabs.onCreated.addListener((tab) => {
        // push new tab in array
        allTabs.push({id: tab.id, url: tab.url});

        // set as current tab
        if (tab.active === true) {
            setCurrentTabId(tab.id);
        }

        console.log('Created tab: ' + tab.id + ' with url: '+ tab.url);
    });

    // listen for url update
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'loading') {
            // update tab value in array
            const tabIndex = allTabs.findIndex(t => t.id === tabId);
            allTabs[tabIndex] = {id: tabId, url: tab.url};

            console.log('Updated tab: ' + tabId + ' with url: '+ tab.url);
        }
    });

    // listen for close
    browser.tabs.onRemoved.addListener((tabId) => {
        // remove tab in array
        const tabIndex = allTabs.findIndex(t => t.id === tabId);
        allTabs.splice(tabIndex, 1);

        console.log('Removed tab: ' + tabId);
    });

    // listen for tab selection
    browser.tabs.onActivated.addListener((activeInfo) => {
        // set as current tab
        setCurrentTabId(activeInfo.tabId);

        console.log('Selected tab: ' + activeInfo.tabId);
    });
}

function getAllWindows() {
    browser.windows.getAll({populate: true})
        .then((windows) => {
            getAllTabs(windows);
        });
}

function getAllTabs(windows) {
    console.log('Loaded ' + windows.length + ' windows');
    const length = windows.length;
    for (let i = 0; i < length; i++) {
        const window = windows[i];
        const length2 = window.tabs.length;
        for (let j = 0; j < length2; j++) {
            const tab = window.tabs[j];
            allTabs.push({id: tab.id, url: tab.url});
            console.log('Loaded tab with id: ' + tab.id + ' and url: ' + tab.url);
            if (tab.active
                && window.focused === true) {
                setCurrentTabId(tab.id);
                console.log('Tab with id: ' + tab.id + ' is active');
            }
        }
    }
}

getAllWindows();
subscribeToTabUpdates();
