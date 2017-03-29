"""supers URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf.urls import url, include
from django.conf import settings
from django.conf.urls.static import static
from gm import views
from tastypie.api import Api
from gm.api import CharacterResource, NewsResource, StageResource, MissionResource, TeamResource, SkillResource

v1_api = Api(api_name='v1')
v1_api.register(CharacterResource())
v1_api.register(MissionResource())
v1_api.register(NewsResource())
v1_api.register(StageResource())
v1_api.register(TeamResource())
v1_api.register(SkillResource())

urlpatterns = [
    url(r'^character/(?P<slug>[\w-]+)/$', views.CharacterSheet),
    url(r'^map/', views.Map),
    url(r'^news/', views.LatestNews),
    url(r'^top-heroes/', views.TopHeroes),
    url(r'^top-teams/', views.TopTeams),
    url(r'^admin/stage/(?P<stage_id>\d+)', views.RunStage),
    url(r'^admin/offer-bonus/(?P<stage_id>\d+)', views.OfferBonus),
    url(r'^admin/mission/', views.RunMission),
    url(r'^admin/mission-dash/', views.MissionDash),
    url(r'^admin/character-dash/', views.CharacterDash),
    url(r'^admin/trigger-mission/(?P<mission_id>\d+)/$', views.TriggerMission),
    url(r'^admin/activate-mission/(?P<mission_id>\d+)/$', views.ActivateMission),
    url(r'^admin/deactivate-mission/(?P<mission_id>\d+)/$', views.DeactivateMission),
    url(r'^admin/activate-character/(?P<character_id>\d+)/$', views.ActivateCharacter),
    url(r'^admin/deactivate-character/(?P<character_id>\d+)/$', views.DeactivateCharacter),
    url(r'^admin/pass-mission/', views.PassMission),
    url(r'^admin/fail-mission/', views.FailMission),
    url(r'^admin/register/(?P<character_id>\d+)/', views.RegisterSuperior),
    url(r'^admin/unregister/(?P<character_id>\d+)/', views.UnregisterSuperior),
    url(r'^admin/update-character-glory/(?P<character_id>\d+)/(?P<glory>-?\d+)/$', views.updateCharacterGlory),
    url(r'^admin/update-character-cooldown/(?P<character_id>\d+)/(?P<cooldown>-?\d+)/$', views.updateCharacterCooldown),
    url(r'^admin/update-team-glory/(?P<team_id>\d+)/(?P<glory>-?\d+)/$', views.updateTeamGlory),
    url(r'^admin/trigger-news/(?P<news_id>[\w-]+)/$', views.TriggerNews),
    url(r'^admin/claim-mission/(?P<mission_id>[\w-]+)/$', views.ClaimMission),
    url(r'^admin/unclaim-mission/(?P<mission_id>[\w-]+)/$', views.UnclaimMission),
    url(r'^admin/fudge/', views.Fudge),
    url(r'^admin/', admin.site.urls),
    url(r'^admin_tools/', include('admin_tools.urls')),
    url(r'^api/', include(v1_api.urls)),
    url(r'^$', views.Homepage),
]
