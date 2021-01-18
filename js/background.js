chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message === "getOptions") {
    localStorage.sign_enable = localStorage.sign_enable ? localStorage.sign_enable : "1";

    sendResponse({
      isEnable: localStorage.sign_enable == '1' ? true : false,
      sign_start_time: localStorage.sign_start_time ? localStorage.sign_start_time : '08:30',
      sign_end_time: localStorage.sign_end_time ? localStorage.sign_end_time : '18:30'
    });
  }
});
