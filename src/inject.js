browser = chrome || browser
const prop = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
const store = (chrome && !!prop(['storage', 'local'], chrome)) ? chrome.storage.local : browser.storage.local
let $activityItems = []
let $activityButton
let $activityButtonAction
let $activityButtonCounter
let $actions
let timer

window.addEventListener('load', function (e) {
  $actions = document.querySelector('.gh-header-actions')
  $activityButton = $actions.appendChild(button())
  $activityButtonAction = $activityButton.querySelector('.action')
  $activityButtonCounter = $activityButton.querySelector('.Counter')
  findItems()
  store.get(['activityVisible'], (data) => {
    if (data.activityVisible) {
      showItems()
    } else {
      hideItems()
    }
  })
  timer = setInterval(findItems, 500)
})

document.addEventListener('keyup', function(e) {
  if (e.ctrlKey && (e.which === 191 || e.which === 65)) {
    toggleActivityItems()
  }
})

function findItems () {
  Array.from(document.querySelectorAll('.TimelineItem, .Details-element'))
    .filter(el => parseInt(window.getComputedStyle(el).height) < 100)
    .map(el => $activityItems.indexOf(el) === -1 ? $activityItems.push(el) : null)
  $activityButtonCounter.innerText = $activityItems.length
}

function toggleActivityItems () {
  store.get(['activityVisible'], (data) => {
    if (!data.activityVisible) {
      showItems()
    } else {
      hideItems()
    }
  })
}

function showItems () {
  $activityButton.classList.add('btn-primary')
  $activityButtonAction.innerText = 'Hide'
  $activityItems.map(el => el.style.display = 'flex')
  store.set({ activityVisible: true })
  browser.runtime.sendMessage({
    path: {
      '48': 'icon-48.png',
      '128': 'icon-128.png'
    }
  })
  findItems()
}

function hideItems () {
  $activityButton.classList.remove('btn-primary')
  $activityButtonAction.innerText = 'Show'
  $activityItems.map(el => el.style.display = 'none')
  store.set({ activityVisible: false })
  browser.runtime.sendMessage({
    path: {
      '48': 'dark-icon-48.png',
      '128': 'dark-icon-128.png'
    }
  })
}

function button () {
  let button = document.createElement('button')
  button.type = 'button'
  button.title = 'Shortcuts: [CTRL]+[/] or [CTRL]+[A]'
  button.className = `btn btn-sm float-none m-0 mr-2 mr-md-0`
  button.style.cssText = 'margin-left: 8px !important;'
  button.innerHTML = `<svg class="octicon octicon-radio-tower" viewBox="0 0 16 16" version="1.1" aria-hidden="true" style="margin-right: 4px;" width="14" height="14"><path fill-rule="evenodd" d="M4.79 6.11c.25-.25.25-.67 0-.92-.32-.33-.48-.76-.48-1.19 0-.43.16-.86.48-1.19.25-.26.25-.67 0-.92a.613.613 0 00-.45-.19c-.16 0-.33.06-.45.19-.57.58-.85 1.35-.85 2.11 0 .76.29 1.53.85 2.11.25.25.66.25.9 0zM2.33.52a.651.651 0 00-.92 0C.48 1.48.01 2.74.01 3.99c0 1.26.47 2.52 1.4 3.48.25.26.66.26.91 0s.25-.68 0-.94c-.68-.7-1.02-1.62-1.02-2.54 0-.92.34-1.84 1.02-2.54a.66.66 0 00.01-.93zm5.69 5.1A1.62 1.62 0 106.4 4c-.01.89.72 1.62 1.62 1.62zM14.59.53a.628.628 0 00-.91 0c-.25.26-.25.68 0 .94.68.7 1.02 1.62 1.02 2.54 0 .92-.34 1.83-1.02 2.54-.25.26-.25.68 0 .94a.651.651 0 00.92 0c.93-.96 1.4-2.22 1.4-3.48A5.048 5.048 0 0014.59.53zM8.02 6.92c-.41 0-.83-.1-1.2-.3l-3.15 8.37h1.49l.86-1h4l.84 1h1.49L9.21 6.62c-.38.2-.78.3-1.19.3zm-.01.48L9.02 11h-2l.99-3.6zm-1.99 5.59l1-1h2l1 1h-4zm5.19-11.1c-.25.25-.25.67 0 .92.32.33.48.76.48 1.19 0 .43-.16.86-.48 1.19-.25.26-.25.67 0 .92a.63.63 0 00.9 0c.57-.58.85-1.35.85-2.11 0-.76-.28-1.53-.85-2.11a.634.634 0 00-.9 0z"></path></svg> <span class="action">Hide</span> Activity <span class="Counter" style="margin-left: 4px;">${$activityItems.length}</span>`
  button.addEventListener('click', toggleActivityItems)
  return button
}
