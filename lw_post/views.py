from django.shortcuts import render
from .models import LW
import json
import random
import requests
from django.http import JsonResponse
from datetime import datetime
# Create your views here.
def top(request): #下から上だけ
    all_lastwords = LW.objects.all()
    lastwords_count = all_lastwords.count()
    return render(request, 'lw_post/top.html', {'all_lastwords':all_lastwords, 'lastwords_count': lastwords_count})

def top_test(request): #パーティクルあり
    #ランダム取得パターン(一斉投稿されたとき)
    """
    all_ids = LW.objects.values_list('id', flat=True)
    divided_count = len(all_ids) // 3
    random_ids = random.sample(list(all_ids), divided_count)
    messages = list(LW.objects.values('id', 'lastwords').filter(id__in=random_ids).order_by('-id'))
    """   
    
    
    #大体投稿集まった時
    #messages = list(LW.objects.values('id', 'lastwords').order_by('?')[:50])
    
    #最新から順番パターン(投稿がまばらなとき)
    messages = list(LW.objects.values('id', 'lastwords', 'seed_screen', 'seed_x').all().order_by('-id')[:50])
    return render(request, 'lw_post/top2.html', {'items': json.dumps(messages)})

prev_datetime = 0000000000
bpm_latest = 0

def data_api(request):
    global prev_datetime, bpm_latest
    
    url = 'https://5oaj55b1vk.execute-api.ap-northeast-1.amazonaws.com/prod/payforword-prod-getdonationInfoNow'
    headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': "56SD7Ozka82xBbOlrwoGN80RL1Azg2iP60WKyw5n"
    }   
    payload = {'prev_datetime': prev_datetime}
    
    response = requests.post(url, headers=headers, json=payload)
    
    data = response.json()
    
    if data["status"] == "1":
        prev_datetime = data["datetime"]
        
        #以下フロントで表示
        #テスト時bmp_latestが10になる
        if data["bpm_latest"]:
            bpm_latest = data["bpm_latest"]
        
        
        flashing_min = data["flashing_sec"] // 60 
        duration_min = (datetime.now() - datetime(2025, 6, 27, 12, 50)).total_seconds() // 60
        
        display_min = flashing_min + duration_min
        
        donation_boxes = data["donation_boxes"]
        if donation_boxes:
            latest_box = donation_boxes[len(donation_boxes) -1]
            LW_flag = latest_box["LWF"]
            step_flag = latest_box["stepsF"]
        else:
            LW_flag = "0"
            step_flag = "0"
            
        front_response = {"LW_flag":LW_flag, "step_flag":step_flag, "bpm_latest":bpm_latest, "display_min":display_min}    
        print(front_response)

        return JsonResponse(front_response)