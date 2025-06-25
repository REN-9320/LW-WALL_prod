const display_min = document.querySelector(".display_min");
const bpm = document.querySelector(".bpm");
const LW_flag = document.querySelector(".LW_flag");
const step_flag = document.querySelector(".step_flag");


function callAPI() {
    fetch("http://127.0.0.1:8000/api")
        .then(response => response.json())
        .then(data => {
            console.log(data);
            display_min.textContent = data.display_min;
            bpm.textContent = data.bpm_latest;
            LW_flag.textContent = data.LW_flag;
            step_flag.textContent = data.step_flag;
        })
        .catch(error => {
            console.error("API呼び出しエラー:", error);
        });
}

// 3000ms = 3秒ごとにcallAPIを実行
callAPI();
setInterval(callAPI, 3000);