from django.shortcuts import render
from .models import LW
import json
import random
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