
/* global chrome */

chrome.runtime.onMessage.addListener(function(message) {
  console.log('extension: injecting...')
  if (message === 'runContentScript'){
    chrome.tabs.insertCSS({ file: 'styles.css' })
    chrome.tabs.executeScript({ file: 'inject.js' })
  }
})

chrome.browserAction.onClicked.addListener(function (tab) {
  console.log('extension: button clicked')
})

console.log('extension: app loaded')
