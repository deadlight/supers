from django.http import Http404
from django.http import HttpResponse
from django.shortcuts import render
from gm.models import Character, News, Mission, Stage

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
