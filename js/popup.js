function $(s) {
  return document.querySelector(s);
}

(function (params) {
  // 初始化开关
  let sign_enable = localStorage.sign_enable ? localStorage.sign_enable : "1";
  if (sign_enable === "1") {
    $("#btn").classList.add("on");
    $("#btn").classList.remove("off");
  } else {
    $("#btn").classList.add("off");
    $("#btn").classList.remove("on");
  }

  // 初始化上班时间
  let sign_start_time = localStorage.sign_start_time
    ? localStorage.sign_start_time
    : "08:30";
  $("#sign_start_time").value = sign_start_time;

  // 初始化下班时间
  let sign_end_time = localStorage.sign_end_time
    ? localStorage.sign_end_time
    : "18:30";
  $("#sign_end_time").value = sign_end_time;

  $("#btn").onclick = function (params) {
    let sign_enable = localStorage.sign_enable ? localStorage.sign_enable : "1";
    if (sign_enable === "1") {
      $("#btn").classList.add("off");
      $("#btn").classList.remove("on");
      localStorage.sign_enable = "0";
    } else {
      $("#btn").classList.add("on");
      $("#btn").classList.remove("off");
      localStorage.sign_enable = "1";
    }
    sendMsg();
  };

  // 修改上班时间
  $("#sign_start_time").onchange = function (event) {
    var time = event.target.value;
    localStorage.sign_start_time = time;
    sendMsg();
  };

  // 修改下斑时间
  $("#sign_end_time").onchange = function (event) {
    var time = event.target.value;
    localStorage.sign_end_time = time;
    sendMsg();
  };
  $("#save_btn").onclick = function () {
    sendMsg();
  };

  function sendMsg() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var value = {
        isEnable: localStorage.sign_enable == "1" ? true : false,
        sign_start_time: localStorage.sign_start_time,
        sign_end_time: localStorage.sign_end_time
      };
      chrome.tabs.sendMessage(tabs[0].id, value, function (response) {
        if (chrome.runtime.lastError) {
        } //加这句访止插件报错
      });
    });
  }
})();