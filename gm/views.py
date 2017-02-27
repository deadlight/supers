from django.http import Http404
from django.http import HttpResponse
from django.shortcuts import render
from gm.models import Character, News, Mission, Stage
from django.db import models
from datetime import datetime
from django.shortcuts import get_object_or_404

def CharacterSheet(request, slug):
    try:
        character = Character.objects.get(slug=slug)
        news = News.objects.filter().all() #TODO: filter properly
    except Character.DoesNotExist:
        raise Http404("Invalid user")
    return render(request, 'character.html', {
        'character': character,
        'news': news
    })

def Map(request):
    public_feed = News.objects.filter().all() #TODO: filter properly
    return render(request, 'map.html', {
        'public_feed': public_feed,
    })

def RunMission(request):
    mission_list = Mission.objects.filter().all() #TODO: filter by available mission
    character_list = Character.objects.filter().all()
    return render(request, 'mission.html', {
        'mission_list': mission_list,
        'character_list': character_list,
    })

def RunStage(request, stage_id):
    stage = Stage.objects.get(id=stage_id)
    return render(request, 'stage.html', {
        'stage': stage,
    })

def MissionDash(request):
    mission_list = Mission.objects.filter().all()
    return render(request, 'mission-dash.html', {
        'mission_list': mission_list,
    })

def TriggerMission(request, mission_id):
    #make mission available
    mission = get_object_or_404(Mission, id=mission_id)
    mission.start_time = datetime.now()
    mission.save()
    return render(request, 'trigger-mission.html')

def TriggerNews(request, news_id):
    #set news item live
    news_item = get_object_or_404(News, id=news_id)
    news_item.trigger_time = datetime.now()
    news_item.save()
    return render(request, 'trigger-news.html')

def ClaimMission(request, mission_id):
    mission = get_object_or_404(Mission, id=mission_id)
    mission.claimed = True
    mission.save()
    return render(request, 'claim-mission.html')

def UnclaimMission(request, mission_id):
    mission = get_object_or_404(Mission, id=mission_id)
    mission.claimed = False
    mission.save()
    return render(request, 'unclaim-mission.html')
