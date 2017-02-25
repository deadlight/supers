from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie import fields
from gm.models import Character, News, Mission, Stage, Team, Skill



class SkillResource(ModelResource):
    class Meta:
        queryset = Skill.objects.all()

class CharacterResource(ModelResource):
    skills = fields.ToManyField(SkillResource, 'skills', full=True)

    class Meta:
        queryset = Character.objects.all()
        resource_name = 'character'
        filtering = {
            'player': ALL
        }

class NewsResource(ModelResource):
    class Meta:
        queryset = News.objects.all()

class MissionResource(ModelResource):
    class Meta:
        queryset = Mission.objects.all()

class StageResource(ModelResource):
    mission = fields.ForeignKey(MissionResource, 'mission', full=True)
    on_success = fields.ForeignKey('self', 'on_success', null=True)
    on_failure = fields.ForeignKey('self', 'on_failure', null=True)
    skills_needed = fields.ToManyField(SkillResource, 'skills_needed', full=True)

    class Meta:
        queryset = Stage.objects.all()
        filtering = {
            'mission': ALL,
            'start_stage': ALL
        }

class TeamResource(ModelResource):
    class Meta:
        queryset = Team.objects.all()
