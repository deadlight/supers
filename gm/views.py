from django.http import Http404
from django.http import HttpResponse
from django.shortcuts import render
from gm.models import Character, News

def character(request, slug):
    try:
        character = Character.objects.get(slug=slug)
        news = News.objects.filter().all() #TODO: filter properly
    except Character.DoesNotExist:
        raise Http404("Invalid user")
    return render(request, 'character.html', {
        'character': character,
        'news': news
    })

def map(request):
    public_feed = News.objects.filter().all() #TODO: filter properly
    return render(request, 'map.html', {
        'public_feed': public_feed,
    })
