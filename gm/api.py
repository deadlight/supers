from tastypie.resources import ModelResource
from tastypie import fields
from gm.models import Character, News, Mission, Stage, Team


class CharacterResource(ModelResource):
    class Meta:
        queryset = Character.objects.all()
        resource_name = 'character'

class NewsResource(ModelResource):
    class Meta:
        queryset = News.objects.all()

class StageResource(ModelResource):
    class Meta:
        queryset = Stage.objects.all()

class MissionResource(ModelResource):
    class Meta:
        queryset = Mission.objects.all()

class TeamResource(ModelResource):
    class Meta:
        queryset = Team.objects.all()
