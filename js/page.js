var btn, t1, t2, t3, enable, btnText;
var SIGN_START_HOUR = 8;
var SIGN_START_MINUTE = 20;
var SIGN_END_HOUR = 18;
var SIGN_END_MINUTE = 30;
var addRandom = true;
// var options = {};

window.onload = function (params) {
  btn = document.querySelector(".oa_btn_submit span");
  getIsEnable();
};

chrome.runtime.onMessage.addListener(function (options, sender, sendResponse) {
  console.log('接收到插件发来的参数', options);
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
  enable = typeof isEnable == 'undefined' ? enable : isEnable;
  if (enable) {
    console.log('%c 自动签到启动', 'color:green');
    enableSign();
  } else {
    console.log('%c 自动签到停止', 'color:red');
    disableSign();
  }
}

function setOption(options) {
  if(options && options.sign_start_time) {
    let st = options.sign_start_time.split(':');
    SIGN_START_HOUR = parseInt(st[0]);
    SIGN_START_MINUTE = parseInt(st[1]);
  }
  if(options && options.sign_end_time) {
    let end = options.sign_end_time.split(':');
    SIGN_END_HOUR = parseInt(end[0]);
    SIGN_END_MINUTE = parseInt(end[1]);
  }
  console.log(SIGN_START_HOUR);
  console.log(SIGN_START_MINUTE);
  console.log(SIGN_END_HOUR);
  console.log(SIGN_END_MINUTE);
}


function enableSign() {
  if (btn && btn.innerText) {
    btnText = btn.innerText;
    main();
  } else {
    // 如果按钮还没正常显示,等会儿再判断
    console.log('如果按钮还没正常显示,等会儿再判断');
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
      signUp();
    } else if (btnText == "今日签退") {
      // 签退
      signOut();
    }
  }

  // 等到了明天刷新
  function reloadTomorrow(params) {
    let date = new Date();
    let h = date.getHours();
    let m = date.getMinutes();
    reloadAfter(((23 - h) * 60 + (61 - m)) * 60000);
  }

  // 签到
  function signUp() {
    if (btnText !== "今日签到") location.reload();
    let now = new Date();
    var week = now.getDay();
    let h = now.getHours();
    let m = now.getMinutes();

    if (week >= 1 && week <= 5) {
      //工作日
      var signTime = new Date();
      signTime.setHours(SIGN_START_HOUR);
      signTime.setMinutes(SIGN_START_MINUTE);
      signTime.setTime(signTime.getTime() - 10 * 60 * 1000)
      if (now.getTime() > signTime.getTime()) {
        // 上班时间
        doClick();
      } else {
        doClick(((SIGN_START_HOUR - h) * 60 + SIGN_START_MINUTE - m) * 60000);
      }
    } else {
      //周未
      reloadAfter(86400000); // 24小时后
    }
  }

  function signOut() {
    if (btnText !== "今日签退") location.reload();
    let now = new Date();
    var week = now.getDay();
    let h = now.getHours();
    let m = now.getMinutes();
    if (week >= 1 && week <= 5) {
      var signTime = new Date();
      signTime.setHours(SIGN_END_HOUR);
      signTime.setMinutes(SIGN_END_MINUTE);
      if (now.getTime() > signTime.getTime()) {
        doClick();
      } else {
        doClick(((SIGN_END_HOUR - h) * 60 + SIGN_END_MINUTE - m) * 60000);
      }
    } else {
      //周未
      reloadAfter(86400000); // 24小时后
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
    var delay_time = waittime + parseInt(Math.random() * 11) * 60000;
    console.log(`${delay_time / 1000 / 60}分钟后自动点击`);
    t3 = setTimeout(function () {
      clearTimeout(t3);
      t3 = null;
      killAlert();
      // btn.click();

      reloadAfter(1000);
    }, delay_time);
  } else {
    killAlert();
    // btn.click();

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
}

// 禁止系统alert
function killAlert(params) {
  var script = document.createElement("script");
  script.setAttribute('id', 'kill-alert');
  script.innerHTML = 'var _alert = window.alert;window.alert = function(){console.log(arguments);}'
  document.head.appendChild(script);
  document.querySelector('#kill-alert').remove();
}

function restoreAlert(params) {
  setTimeout(()=>{
    var script = document.createElement("script");
    script.setAttribute('id', 're-alert');
    script.innerHTML = 'window.alert = _alert;'
    document.head.appendChild(script)
    document.querySelector('#re-alert').remove();
  }, 1000);
}