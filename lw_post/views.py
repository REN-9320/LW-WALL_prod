from django.shortcuts import render
from .models import LW, StartTime
import json
import random
import requests
from django.http import JsonResponse
from datetime import datetime
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
def top(request): #下から上だけ
    all_lastwords = LW.objects.all()
    lastwords_count = all_lastwords.count()
    return render(request, 'lw_post/top.html', {'all_lastwords':all_lastwords, 'lastwords_count': lastwords_count})

def top_test(request): #パーティクルあり
    messages = list(LW.objects.values('id', 'lastwords', 'seed_screen', 'seed_x').all().order_by('-id'))
    return render(request, 'lw_post/top2.html', {'items': json.dumps(messages)})

def top_test_black(request):
    messages = list(LW.objects.values('id', 'lastwords', 'seed_screen', 'seed_x').all().order_by('-id'))
    return render(request, 'lw_post/black.html', {'items': json.dumps(messages)})

aware_dt_2nd = timezone.make_aware(datetime(2025, 6, 28, 0, 0)) #二日目以降を判別
now = timezone.now()

if aware_dt_2nd < now:
    start_time = StartTime.objects.latest("created_at")
else:
    start_time = None

prev_datetime = 0000000000
bpm_latest = 0

@csrf_exempt
def data_api(request):
    global prev_datetime, bpm_latest, start_time
    
    #データ取得
    url = 'https://5oaj55b1vk.execute-api.ap-northeast-1.amazonaws.com/prod/payforword-prod-getdonationInfoNow'
    headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': "56SD7Ozka82xBbOlrwoGN80RL1Azg2iP60WKyw5n"
    }   
    payload = {'prev_datetime': prev_datetime}
    
    response = requests.post(url, headers=headers, json=payload)
    
    data = response.json()
    print(data)

    #データ処理
    if data["status"] == "1":
        
        prev_datetime = data["datetime"]
        print(prev_datetime)
        if data["bpm_latest"]:
            bpm_latest = data["bpm_latest"]
        
        #経過時間処理
        now = timezone.now()
        aware_dt_min = timezone.make_aware(datetime(2025, 6, 27, 12, 0))
        aware_dt_max = timezone.make_aware(datetime(2025, 6, 27, 14, 0))
        aware_dt_start = timezone.make_aware(datetime(2025, 6, 27, 12, 30))
        # if data["mode"] == "4" and start_time is None:
            
        #     if aware_dt_min < now < aware_dt_max:
        #         start_time = StartTime.objects.create()
        #         duration_min = (now - start_time.created_at).total_seconds() // 60
        #     else:
        #         duration_min = (now - aware_dt_start).total_seconds() // 60
            
        # else:
        #     if start_time is not None:
        #         #duration_min = (datetime.now() - StartTime.objects.earliest("created_at").created_at).total_seconds() // 60
        #         duration_min = (now - start_time.created_at).total_seconds() // 60
        #     else:
        #         duration_min = (now - aware_dt_start).total_seconds() // 60

        if data["mode"] == "4":
            if start_time is None:
                if aware_dt_min < now < aware_dt_max:
                    start_time = StartTime.objects.create()
                    duration_min = (now - start_time.created_at).total_seconds() // 60
                    print(1)
                else:
                    duration_min = (now - aware_dt_start).total_seconds() // 60
                    print(2)
            else:
                    duration_min = (now - start_time.created_at).total_seconds() // 60
                    print(3)
        else:
            duration_min = 0
            print(4)
        
        flashing_min = data["flashing_sec"] // 60 
        display_min = flashing_min + duration_min
        
        #プログレスバーの経過時間と点灯時間の比を計算
        duration_ratio = duration_min / 4321
        flashing_ratio = flashing_min / 4321
        
        if duration_ratio + flashing_ratio > 1:
            flashing_ratio = 1 - duration_ratio
        print(duration_ratio)
        print(flashing_ratio)
        donation_boxes = data["donation_boxes"]
        if donation_boxes:
            latest_box = donation_boxes[len(donation_boxes) -1]
            LW_flag = latest_box["LWF"]
            step_flag = latest_box["stepsF"]
        else:
            LW_flag = "0"
            step_flag = "0"
            
        front_response = {
            "LW_flag":LW_flag, 
            "step_flag":step_flag, 
            "bpm_latest":bpm_latest, 
            "display_min":display_min, 
            "duration_ratio":duration_ratio,
            "flashing_ratio": flashing_ratio,
            }    

        return JsonResponse(front_response)