document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('show_btn').onclick = () => {
    chrome.tabs.executeScript({
      file: 'js/monitor.js'
    });
  }

  document.getElementById('show_btn_grocery').onclick = () => {
    chrome.tabs.executeScript({
      file: 'js/monitor_grocery.js'
    });
  }

  document.getElementById('breaks_monitor').onclick = () => {
    chrome.tabs.executeScript({
      file: 'js/breaks_monitor.js'
    });
  }
})