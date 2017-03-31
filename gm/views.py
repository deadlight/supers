from django.http import Http404
from django.http import HttpResponse
from django.shortcuts import render
from gm.models import Character, News, Mission, Stage, Team
from django.db import models
from django.shortcuts import get_object_or_404
from django.utils.timezone import now, timedelta
from math import floor

def CharacterSheet(request, slug):
    try:
        character = Character.objects.get(slug=slug)
        contacts = []
        for contact in character.contacts.all():
            contacts.append(contact.id)
        news = News.objects.filter(trigger_time__lte=now()).filter(active=True).filter(contacts__in=contacts).extra(order_by=['-trigger_time']).all()[:20]
        try:
            team = Team.objects.get(members=character.id)
        except Team.DoesNotExist:
            team = None;

        if character.cooldown < now():
            available = True
            time_to_available = 0
        else:
            available = False
            time_to_available = character.cooldown-now()
            time_to_available = floor(time_to_available.total_seconds()/60)+1
    except Character.DoesNotExist:
        raise Http404("Invalid user")
    return render(request, 'character.html', {
        'character': character,
        'news': news,
        'available': available,
        'time_to_available': time_to_available,
        'team': team,
    })

def Map(request):
    public_feed = News.objects.filter(trigger_time__lte=now()).filter(active=True).filter(contacts=1).extra(order_by=['-trigger_time']).all()[:10]
    return render(request, 'map.html', {
        'public_feed': public_feed,
    })

def RunMission(request):
    mission_list = Mission.objects.filter(active=True).filter(claimed=False).all();
    character_list = Character.objects.filter(cooldown__lte=now()).all()
    return render(request, 'mission.html', {
        'mission_list': mission_list,
        'character_list': character_list,
    })

def RunStage(request, stage_id):
    stage = Stage.objects.get(id=stage_id)
    return render(request, 'stage.html', {
        'stage': stage,
    })

def OfferBonus(request, stage_id):
    stage = Stage.objects.get(id=stage_id)
    return render(request, 'offer-bonus.html', {
        'stage': stage,
    })

def NewsDash(request):
    active_news_list = News.objects.filter(active=True).filter(trigger_time__lte=now()).extra(order_by=['-trigger_time']).all()
    future_news_list = News.objects.filter(active=True).filter(trigger_time__gte=now()).extra(order_by=['-trigger_time']).all()
    inactive_news_list = News.objects.filter(active=False).extra(order_by=['-trigger_time']).all()
    return render(request, 'news-dash.html', {
        'active_news_list': active_news_list,
        'future_news_list': future_news_list,
        'inactive_news_list': inactive_news_list,
    })

def MissionDash(request):
    mission_list = Mission.objects.filter().order_by('name').all()
    return render(request, 'mission-dash.html', {
        'mission_list': mission_list,
    })

def CharacterDash(request):
    character_list = Character.objects.filter().order_by('name').all()
    for character in character_list:
        time_to_available = character.cooldown-now()
        time_to_available = floor(time_to_available.total_seconds()/60)+1
        if time_to_available < 0:
            time_to_available = 0
        character.time_to_available = time_to_available
    return render(request, 'character-dash.html', {
        'character_list': character_list,
    })

def TriggerMission(request, mission_id):
    #make mission available
    mission = get_object_or_404(Mission, id=mission_id)
    mission.active = True
    mission.claimed = False
    mission.save()
    return render(request, 'trigger-mission.html')

def TriggerNews(request, news_id):
    #set news item live
    news_item = get_object_or_404(News, id=news_id)
    news_item.trigger_time = now()
    news_item.save()
    return render(request, 'trigger-news.html')

def ActivateNews(request, news_id, minutes):
    #activate news item
    news_item = get_object_or_404(News, id=news_id)
    news_item.trigger_time = now() + timedelta(minutes = int(minutes))
    news_item.active = True
    news_item.save()
    return render(request, 'trigger-news.html')

def DeactivateNews(request, news_id):
    #deactivate news item
    news_item = get_object_or_404(News, id=news_id)
    news_item.active = False
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

def PassMission(request):
    return render(request, 'pass-mission.html')

def FailMission(request):
    return render(request, 'fail-mission.html')

def updateCharacterGlory(request, character_id, glory):
    character = get_object_or_404(Character, id=character_id)
    character.glory += int(glory)
    character.save()
    return render(request, 'glory-updated.html')

def updateCharacterCooldown(request, character_id, cooldown):
    character = get_object_or_404(Character, id=character_id)
    if int(cooldown) < 0:
        cooldown = 0
    character.cooldown = now() + timedelta(minutes = int(cooldown))
    character.save()
    return render(request, 'cooldown-updated.html')

def updateTeamGlory(request, team_id, glory):
    team = get_object_or_404(Team, id=team_id)
    team.glory += int(glory)
    team.save()
    return render(request, 'glory-updated.html')

def LatestNews(request):
    public_feed = News.objects.filter(trigger_time__lte=now()).filter(active=True).filter(contacts=1).extra(order_by=['-trigger_time']).all()[:10]
    return render(request, 'news.html', {
        'public_feed': public_feed,
    })

def TopHeroes(request):
    top_heroes = Character.objects.extra(order_by=['-glory']).all()[:5]
    return render(request, 'top-heroes.html', {
        'top_heroes': top_heroes,
    })

def TopTeams(request):
    top_teams = Team.objects.extra(order_by=['-glory']).all()[:5]
    return render(request, 'top-teams.html', {
        'top_teams': top_teams,
    })

def Homepage(request):
    return render(request, 'homepage.html')

def Fudge(request):
    character_list = Character.objects.filter().all()
    mission_list = Mission.objects.filter().all()
    return render(request, 'fudge.html', {
        'character_list': character_list,
        'mission_list': mission_list,
    })

def RegisterSuperior(request, character_id):
    character = get_object_or_404(Character, id=character_id)
    character.registered = True
    character.save()
    return render(request, 'registered.html')

def UnregisterSuperior(request, character_id):
    character = get_object_or_404(Character, id=character_id)
    character.registered = False
    character.save()
    return render(request, 'registered.html')

def ActivateMission(request, mission_id):
    mission = get_object_or_404(Mission, id=mission_id)
    mission.active = True
    mission.save()
    return render(request, 'trigger-mission.html')

def DeactivateMission(request, mission_id):
    mission = get_object_or_404(Mission, id=mission_id)
    mission.active = False
    mission.save()
    return render(request, 'trigger-mission.html')

def ActivateCharacter(request, character_id):
    character = get_object_or_404(Character, id=character_id)
    character.active = True
    character.save()
    return render(request, 'updated-character.html')

def DeactivateCharacter(request, character_id):
    character = get_object_or_404(Character, id=character_id)
    character.active = False
    character.save()
    return render(request, 'updated-character.html')
