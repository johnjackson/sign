var btn, t1, t2, t3, enable, btnText;
var SIGN_START_HOUR = 8;
var SIGN_START_MINUTE = 30;
var SIGN_END_HOUR = 18;
var SIGN_END_MINUTE = 30;

var sign_time_start;
var sign_time_end;
// var addRandom = true;

window.onload = function (params) {
  btn = document.querySelector(".oa_btn_submit span");
  getIsEnable();
};

chrome.runtime.onMessage.addListener(function (options, sender, sendResponse) {
  // console.log('接收到插件发来的参数', options);
  setOption(options);
  start(options.isEnable);
});

// 从插件的本地存储中获取设置
function getIsEnable() {
  chrome.runtime.sendMessage("getOptions", function (options) {
    // console.log('options', options);
    setOption(options);
    start(options.isEnable);
  });
}

function start(isEnable) {
  enable = typeof isEnable == "undefined" ? enable : isEnable;
  if (enable) {
    console.log("%c 自动签到启动", "color:green");
    setTimeout(() => {
      enableSign();
    }, 3000);
  } else {
    console.log("%c 自动签到停止", "color:red");
    disableSign();
  }
}

function setOption(options) {
  if (options && options.sign_start_time) {
    let st = options.sign_start_time.split(":");
    SIGN_START_HOUR = parseInt(st[0]);
    SIGN_START_MINUTE = parseInt(st[1]);
  }
  if (options && options.sign_end_time) {
    let end = options.sign_end_time.split(":");
    SIGN_END_HOUR = parseInt(end[0]);
    SIGN_END_MINUTE = parseInt(end[1]);
  }

  sign_time_start = new Date();
  sign_time_start.setHours(SIGN_START_HOUR);
  sign_time_start.setMinutes(SIGN_START_MINUTE);
  sign_time_end = new Date();
  sign_time_end.setHours(SIGN_END_HOUR);
  sign_time_end.setMinutes(SIGN_END_MINUTE);

  console.log("上班时间", sign_time_start.toLocaleTimeString());
  console.log("下班时间", sign_time_end.toLocaleTimeString());
}

function enableSign() {
  if (btn && btn.innerText) {
    btnText = btn.innerText;
    main();
  } else {
    // 如果按钮还没正常显示,等会儿再判断
    console.log("按钮还没正常显示,等30秒再判断");

    t1 = setTimeout(() => {
      clearTimeout(t1);
      t1 = null;

      btn = document.querySelector(".oa_btn_submit span");
      btnText = btn.innerText;
      if (btnText) {
        main();
      } else {
        location.reload();
      }
    }, 30000);
  }

  function main() {
    //判断当前按钮状态是加班的话，就等到第二天再刷新页面
    if (btnText.indexOf("加班") != -1) {
      reloadTomorrow();
    } else if (btnText == "今日签到") {
      // 签到
      sign(true);
    } else if (btnText == "今日签退") {
      // 签退
      sign(false);
    }
  }

  // 等到了明天刷新
  function reloadTomorrow(params) {
    let date = new Date();
    let h = date.getHours();
    let m = date.getMinutes();
    let mins = ((23 - h) * 60 + (61 - m)) ;
    console.log(`今天已签退，过了晚上24点(${mins}分钟后)页面将自动刷新`);
    reloadAfter(mins * 60000);
  }

  // 签到
  function sign(isSignUp) {
    let sign_time;
    if (isSignUp) {
      if (btnText !== "今日签到") location.reload();
      sign_time = sign_time_start.getTime() - 600000; //上班打卡开始时间距上班时间提前10分钟
    } else {
      if (btnText !== "今日签退") location.reload();
      sign_time = sign_time_end.getTime();
    }
    let now = new Date();
    var week = now.getDay();
    let now_time = now.getTime();
    if (week >= 1 && week <= 5) {
      //工作日
      if (now_time >= sign_time) {
        // 现在可以打卡，立即打卡
        doClick();
      } else {
        doClick(sign_time - now_time);
      }
    } else {
      //周未
      reloadAfter(86400000); // 24小时后刷新
    }
  }
}

function disableSign() {
  clearTimeout(t1);
  clearTimeout(t2);
  clearTimeout(t3);
  t1 = null;
  t2 = null;
  t3 = null;
}

function doClick(waittime) {
  if (!enable) return;

  if (waittime) {
    // if(addRandom) {
    //   parseInt(Math.random()*11) * 60000;
    // }
    var delay_time = parseInt(waittime + parseInt(Math.random() * 10) * 60000);
    console.log('%d分钟后自动打卡', parseInt(delay_time / 60000));
    t3 = setTimeout(function () {
      clearTimeout(t3);
      t3 = null;
      killAlert();
      btn.click();

      reloadAfter(1000);
    }, delay_time);
  } else {
    killAlert();
    btn.click();

    reloadAfter(1000);
  }
}

function reloadAfter(ms) {
  clearTimeout(t2);
  t2 = setTimeout(function () {
    clearTimeout(t2);
    t2 = null;
    location.reload();
  }, ms);
  console.log(`${ms/60000}分钟后会刷新页面`);
}

// 禁止系统alert
function killAlert(params) {
  var script = document.createElement("script");
  script.setAttribute("id", "kill-alert");
  script.innerHTML =
    "var _alert = window.alert;window.alert = function(){console.log(arguments);}";
  document.head.appendChild(script);
  document.querySelector("#kill-alert").remove();
}

function restoreAlert(params) {
  setTimeout(() => {
    var script = document.createElement("script");
    script.setAttribute("id", "re-alert");
    script.innerHTML = "window.alert = _alert;";
    document.head.appendChild(script);
    document.querySelector("#re-alert").remove();
  }, 1000);
}
