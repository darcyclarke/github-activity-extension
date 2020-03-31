browser = chrome || browser
const prop = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
const store = (chrome && !!prop(['storage', 'local'], chrome)) ? chrome.storage.local : browser.storage.local
let isZenhub = false
let $activityItems = { all: [] }
let $activityButton
let $activityButtonAction
let $activityButtonCounter
let $container
let $sidebar
let timer

window.addEventListener('load', function (e) {
  const path = window.location.pathname
  if (!path.includes('/pull/') && !path.includes('/issues/')) {
    return
  }
  findItems()
  store.get(['activityVisible'], (data) => {
    if (data.activityVisible) {
      showItems()
    } else {
      hideItems()
    }
  })
  timer = setInterval(findItems, 500)
  setTimeout(_ => {
    $sidebar = document.querySelector('#partial-discussion-sidebar')
    $sidebar.prepend(container())
    $container = $sidebar.querySelector('.js-sidebar-activity')
    $container.append(button())
    $activityButton = $sidebar.querySelector('.js-sidebar-activity .js-activity-toggle')
    $activityButtonAction = $activityButton.querySelector('.action')
    $activityButtonCounter = $activityButton.querySelector('.Counter')
    $activityButtonCounter.innerText = $activityItems.all.length
  }, 500)
})

document.addEventListener('keyup', function(e) {
  if (e.ctrlKey && (e.which === 191 || e.which === 65)) {
    toggleActivityItems()
  }
})

function contains (el, classNames) {
  let found = false
  classNames = (typeof classNames === 'string') ? [classNames] : classNames
  classNames.map(name => {
    if (!!el.classList.contains(name) || !!el.querySelectorAll(`.${name}`).length) {
      found = true
    }
  })
  return found
}

function findItems () {
  const all = Array.from(document.querySelectorAll('.TimelineItem, .Details-element'))
  const original = all.shift()
  $activityItems = {
    all,
    original,
    comments: all.filter(el => !!el.querySelectorAll('.timeline-comment-group').length),
    users: all.filter(el => contains(el, 'octicon-person')),
    labels: all.filter(el => contains(el, 'octicon-tag')),
    mentions: all.filter(el => contains(el, 'octicon-bookmark')),
    projects: all.filter(el => contains(el, 'octicon-project')),
    status: all.filter(el => contains(el, ['octicon-circle-slash', 'octicon octicon-check'])),
    zenhub: all.filter(el => contains(el, 'zh-timeline-item')),
    dependencies: all.filter(el => contains(el, 'zh-dependency-manager-container')),
    epics: all.filter(el => contains(el, 'zh-epic-issue-container'))
  }
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
  $activityItems.all.map(el => el.style.display = 'flex')
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
  $activityItems.all.map(el => el.style.display = 'none')
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
  button.className = `btn btn-sm float-none m-0 mr-2 mr-md-0 js-activity-toggle`
  button.style.cssText = 'width:100%;'
  button.innerHTML = `<svg class="octicon octicon-radio-tower" viewBox="0 0 16 16" version="1.1" aria-hidden="true" style="margin-right: 4px;" width="14" height="14"><path fill-rule="evenodd" d="M4.79 6.11c.25-.25.25-.67 0-.92-.32-.33-.48-.76-.48-1.19 0-.43.16-.86.48-1.19.25-.26.25-.67 0-.92a.613.613 0 00-.45-.19c-.16 0-.33.06-.45.19-.57.58-.85 1.35-.85 2.11 0 .76.29 1.53.85 2.11.25.25.66.25.9 0zM2.33.52a.651.651 0 00-.92 0C.48 1.48.01 2.74.01 3.99c0 1.26.47 2.52 1.4 3.48.25.26.66.26.91 0s.25-.68 0-.94c-.68-.7-1.02-1.62-1.02-2.54 0-.92.34-1.84 1.02-2.54a.66.66 0 00.01-.93zm5.69 5.1A1.62 1.62 0 106.4 4c-.01.89.72 1.62 1.62 1.62zM14.59.53a.628.628 0 00-.91 0c-.25.26-.25.68 0 .94.68.7 1.02 1.62 1.02 2.54 0 .92-.34 1.83-1.02 2.54-.25.26-.25.68 0 .94a.651.651 0 00.92 0c.93-.96 1.4-2.22 1.4-3.48A5.048 5.048 0 0014.59.53zM8.02 6.92c-.41 0-.83-.1-1.2-.3l-3.15 8.37h1.49l.86-1h4l.84 1h1.49L9.21 6.62c-.38.2-.78.3-1.19.3zm-.01.48L9.02 11h-2l.99-3.6zm-1.99 5.59l1-1h2l1 1h-4zm5.19-11.1c-.25.25-.25.67 0 .92.32.33.48.76.48 1.19 0 .43-.16.86-.48 1.19-.25.26-.25.67 0 .92a.63.63 0 00.9 0c.57-.58.85-1.35.85-2.11 0-.76-.28-1.53-.85-2.11a.634.634 0 00-.9 0z"></path></svg><span class="action">Hide</span> Activity <span class="Counter" style="margin-left: 4px;">${$activityItems.all.length}</span>`
  button.addEventListener('click', toggleActivityItems)
  return button
}

function container (state) {
  let container = document.createElement('div')
  container.className = 'discussion-sidebar-item js-discussion-sidebar-item js-sidebar-activity'
  container.innerHTML = `
    <style>
    .js-sidebar-activity .select-menu-item-heading {
      font-size:12px!important;
    }
    .js-sidebar-activity .select-menu-item[aria-checked=true] .octicon-x {
      display: none;
    }
    </style>
    <details class="details-reset details-overlay select-menu">
      <summary class="text-bold discussion-sidebar-heading discussion-sidebar-toggle" aria-haspopup="menu" data-hotkey="a" role="button">
        <svg class="octicon octicon-gear" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M14 8.77v-1.6l-1.94-.64-.45-1.09.88-1.84-1.13-1.13-1.81.91-1.09-.45-.69-1.92h-1.6l-.63 1.94-1.11.45-1.84-.88-1.13 1.13.91 1.81-.45 1.09L0 7.23v1.59l1.94.64.45 1.09-.88 1.84 1.13 1.13 1.81-.91 1.09.45.69 1.92h1.59l.63-1.94 1.11-.45 1.84.88 1.13-1.13-.92-1.81.47-1.09L14 8.75v.02zM7 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"></path></svg>
        Activity Items
      </summary>
      <details-menu class="select-menu-modal position-absolute right-0 hx_rsm-modal js-discussion-sidebar-menu" style="z-index: 99; overflow: visible;" data-multiple="" data-menu-max-options="10">
        <div class="select-menu-header">
          <span class="select-menu-title">Choose which items to <span class="action">show</span></span>
        </div>
        <div class="hx_rsm-content" role="menu">
          <div class="select-menu-list">
            <label class="select-menu-item text-normal" role="menuitemcheckbox" aria-checked="false" tabindex="0">
              <svg class="octicon octicon-x select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"></path></svg>
              <svg class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
              <input style="display:none" type="checkbox" checked value="" name="activity_select_all">
              <div class="select-menu-item-text">
                <span class="select-menu-item-heading">
                  <span class="description js-description">Unselect All</span>
                </span>
              </div>
            </label>
            <label class="select-menu-item text-normal" role="menuitemcheckbox" aria-checked="true" tabindex="0">
              <svg class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
              <input style="display:none" type="checkbox" value="" name="activity_select_comments">
              <div class="select-menu-item-text">
                <span class="select-menu-item-heading">
                  <svg class="octicon octicon-comment" style="height:12px;width:12px;margin:0 4px 0 0;" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M14 1H2c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h2v3.5L7.5 11H14c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm0 9H7l-2 2v-2H2V2h12v8z"></path></svg>
                  <span class="">Comments</span>
                </span>
              </div>
            </label>
            <label class="select-menu-item text-normal" role="menuitemcheckbox" aria-checked="true" tabindex="0">
              <svg class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
              <input style="display:none" type="checkbox" checked value="" name="activity_select_users">
              <div class="select-menu-item-text">
                <span class="select-menu-item-heading">
                  <svg class="octicon octicon-person" style="height:12px;width:12px;margin:0 4px 0 0;" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 14.002a.998.998 0 01-.998.998H1.001A1 1 0 010 13.999V13c0-2.633 4-4 4-4s.229-.409 0-1c-.841-.62-.944-1.59-1-4 .173-2.413 1.867-3 3-3s2.827.586 3 3c-.056 2.41-.159 3.38-1 4-.229.59 0 1 0 1s4 1.367 4 4v1.002z"></path></svg>
                  <span class="">Users</span>
                </span>
              </div>
            </label>
            <label class="select-menu-item text-normal" role="menuitemcheckbox" aria-checked="true" tabindex="0">
              <svg class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
              <input style="display:none" type="checkbox" checked value="" name="activity_select_labels">
              <div class="select-menu-item-text">
                <span class="select-menu-item-heading">
                  <svg class="octicon octicon-tag" style="height:12px;width:12px;margin:0 4px 0 0;" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M7.73 1.73C7.26 1.26 6.62 1 5.96 1H3.5C2.13 1 1 2.13 1 3.5v2.47c0 .66.27 1.3.73 1.77l6.06 6.06c.39.39 1.02.39 1.41 0l4.59-4.59a.996.996 0 000-1.41L7.73 1.73zM2.38 7.09c-.31-.3-.47-.7-.47-1.13V3.5c0-.88.72-1.59 1.59-1.59h2.47c.42 0 .83.16 1.13.47l6.14 6.13-4.73 4.73-6.13-6.15zM3.01 3h2v2H3V3h.01z"></path></svg>
                  <span class="">Labels</span>
                </span>
              </div>
            </label>
            <label class="select-menu-item text-normal" role="menuitemcheckbox" aria-checked="true" tabindex="0">
              <svg class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
              <input style="display:none" type="checkbox" checked value="" name="activity_select_mentions">
              <div class="select-menu-item-text">
                <span class="select-menu-item-heading">
                  <svg class="octicon octicon-mention" style="height:12px;width:12px;margin:0 4px 0 0;" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M6.58 15c1.25 0 2.52-.31 3.56-.94l-.42-.94c-.84.52-1.89.83-3.03.83-3.23 0-5.64-2.08-5.64-5.72 0-4.37 3.23-7.18 6.58-7.18 3.45 0 5.22 2.19 5.22 5.2 0 2.39-1.34 3.86-2.5 3.86-1.05 0-1.36-.73-1.05-2.19l.73-3.75H8.98l-.11.72c-.41-.63-.94-.83-1.56-.83-2.19 0-3.66 2.39-3.66 4.38 0 1.67.94 2.61 2.3 2.61.84 0 1.67-.53 2.3-1.25.11.94.94 1.45 1.98 1.45 1.67 0 3.77-1.67 3.77-5C14 2.61 11.59 0 7.83 0 3.66 0 0 3.33 0 8.33 0 12.71 2.92 15 6.58 15zm-.31-5c-.73 0-1.36-.52-1.36-1.67 0-1.45.94-3.22 2.41-3.22.52 0 .84.2 1.25.83l-.52 3.02c-.63.73-1.25 1.05-1.78 1.05V10z"></path></svg>
                  <span class="">Mentions</span>
                </span>
              </div>
            </label>
            <label class="select-menu-item text-normal" role="menuitemcheckbox" aria-checked="true" tabindex="0">
              <svg class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
              <input style="display:none" type="checkbox" checked value="" name="activity_select_projects">
              <div class="select-menu-item-text">
                <span class="select-menu-item-heading">
                  <svg class="octicon octicon-project" style="height:12px;width:12px;margin:0 4px 0 0;" viewBox="0 0 15 16" version="1.1" width="15" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M10 12h3V2h-3v10zm-4-2h3V2H6v8zm-4 4h3V2H2v12zm-1 1h13V1H1v14zM14 0H1a1 1 0 00-1 1v14a1 1 0 001 1h13a1 1 0 001-1V1a1 1 0 00-1-1z"></path></svg>
                  <span class="">Projects</span>
                </span>
              </div>
            </label>
            <label class="select-menu-item text-normal" role="menuitemcheckbox" aria-checked="true" tabindex="0">
              <svg class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
              <input style="display:none" type="checkbox" checked value="" name="activity_select_status">
              <div class="select-menu-item-text">
                <span class="select-menu-item-heading">
                  <svg class="octicon octicon-git-commit" style="height:12px;width:12px;margin:0 4px 0 0;" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M10.86 7c-.45-1.72-2-3-3.86-3-1.86 0-3.41 1.28-3.86 3H0v2h3.14c.45 1.72 2 3 3.86 3 1.86 0 3.41-1.28 3.86-3H14V7h-3.14zM7 10.2c-1.22 0-2.2-.98-2.2-2.2 0-1.22.98-2.2 2.2-2.2 1.22 0 2.2.98 2.2 2.2 0 1.22-.98 2.2-2.2 2.2z"></path></svg>
                  <span class="">Status</span>
                </span>
              </div>
            </label>
            <label class="select-menu-item text-normal" role="menuitemcheckbox" aria-checked="true" tabindex="0">
              <svg class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
              <input style="display:none" type="checkbox" checked value="" name="activity_select_zenhub">
              <div class="select-menu-item-text lh-condensed">
                <span class="select-menu-item-heading">
                  <svg class="octicon octicon-checklist" style="height:12px;width:12px;margin:0 4px 0 0;" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M16 8.5l-6 6-3-3L8.5 10l1.5 1.5L14.5 7 16 8.5zM5.7 12.2l.8.8H2c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h7c.55 0 1 .45 1 1v6.5l-.8-.8c-.39-.39-1.03-.39-1.42 0L5.7 10.8a.996.996 0 000 1.41v-.01zM4 4h5V3H4v1zm0 2h5V5H4v1zm0 2h3V7H4v1zM3 9H2v1h1V9zm0-2H2v1h1V7zm0-2H2v1h1V5zm0-2H2v1h1V3z"></path></svg>
                  <span class="description js-description"><strong>ZenHub</strong> - All</span>
                </span>
              </div>
            </label>
            <label class="select-menu-item text-normal" role="menuitemcheckbox" aria-checked="true" tabindex="0">
              <svg class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
              <input style="display:none" type="checkbox" checked value="" name="activity_select_zenhub_dependancies">
              <div class="select-menu-item-text">
                <span class="select-menu-item-heading">
                  <svg class="octicon octicon-list-unordered" style="height:12px;width:12px;margin:0 4px 0 0;" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M2 13c0 .59 0 1-.59 1H.59C0 14 0 13.59 0 13c0-.59 0-1 .59-1h.81c.59 0 .59.41.59 1H2zm2.59-9h6.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1H4.59C4 2 4 2.41 4 3c0 .59 0 1 .59 1zM1.41 7H.59C0 7 0 7.41 0 8c0 .59 0 1 .59 1h.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1h.01zm0-5H.59C0 2 0 2.41 0 3c0 .59 0 1 .59 1h.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1h.01zm10 5H4.59C4 7 4 7.41 4 8c0 .59 0 1 .59 1h6.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1h.01zm0 5H4.59C4 12 4 12.41 4 13c0 .59 0 1 .59 1h6.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1h.01z"></path></svg>
                  <span class="description js-description"><strong>ZenHub</strong> - Dependencies</span>
                </span>
              </div>
            </label>
            <label class="select-menu-item text-normal" role="menuitemcheckbox" aria-checked="true" tabindex="0">
              <svg class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
              <input style="display:none" type="checkbox" checked value="" name="activity_select_zenhub_epics">
              <div class="select-menu-item-text">
                <span class="select-menu-item-heading">
                  <svg class="octicon octicon-bookmark" style="height:12px;width:12px;margin:0 4px 0 0;" viewBox="0 0 10 16" version="1.1" width="10" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M9 0H1C.27 0 0 .27 0 1v15l5-3.09L10 16V1c0-.73-.27-1-1-1zm-.78 4.25L6.36 5.61l.72 2.16c.06.22-.02.28-.2.17L5 6.6 3.12 7.94c-.19.11-.25.05-.2-.17l.72-2.16-1.86-1.36c-.17-.16-.14-.23.09-.23l2.3-.03.7-2.16h.25l.7 2.16 2.3.03c.23 0 .27.08.09.23h.01z"></path></svg>
                  <span class="description js-description"><strong>ZenHub</strong> - Epics</span>
                </span>
              </div>
            </label>
          </div>
        </div>
      </details-menu>
    </details>
  `
  return container
}
