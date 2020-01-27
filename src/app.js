browser = chrome || browser
browser.browserAction.onClicked.addListener(function (tab) {
  browser.tabs.executeScript(tab.id,{
    code: "toggleActivityItems();"
  })
})

browser.runtime.onMessage.addListener(function(request, sender) {
  browser.browserAction.setIcon({
    path: request.path
  })
})
