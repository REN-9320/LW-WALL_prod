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
            bpm.textContent = `Current: ${data.bpm_latest} bpm`;
            if (data.LW_flag === '1') {
                LW_flag.classList.add("flag_on");
                document.querySelector('.LW_flag img').src = LW_on_src;
            } else {
                LW_flag.classList.remove("flag_on");
                document.querySelector('.LW_flag img').src = LW_off_src;
            }
            if (data.step_flag === '1') {
                step_flag.classList.add("flag_on");
                document.querySelector('.step_flag img').src = step_on_src;
            } else {
                step_flag.classList.remove("flag_on");
                document.querySelector('.step_flag img').src = step_off_src;
            }
        })
        .catch(error => {
            console.error("API呼び出しエラー:", error);
        });
}

// 3000ms = 3秒ごとにcallAPIを実行
callAPI();
setInterval(callAPI, 3000);