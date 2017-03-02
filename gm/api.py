from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie import fields
from gm.models import Character, News, Mission, Stage, Team, Skill, TeamCharacterLink



class SkillResource(ModelResource):
    class Meta:
        queryset = Skill.objects.all()

class CharacterResource(ModelResource):
    skills = fields.ToManyField(SkillResource, 'skills', full=True, null=True)
    team = fields.ToManyField(SkillResource, 'member_of', full=True, null=True)

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
    news_on_success = fields.ToManyField(NewsResource, 'news_on_success', null=True)
    news_on_failure = fields.ToManyField(NewsResource, 'news_on_failure', null=True)
    skills_needed = fields.ToManyField(SkillResource, 'skills_needed', full=True)

    class Meta:
        queryset = Stage.objects.all()
        filtering = {
            'mission': ALL,
            'start_stage': ALL,
            'id': ALL,
        }

class TeamResource(ModelResource):
    members = fields.ToManyField(CharacterResource, 'members', full=True)
    class Meta:
        queryset = Team.objects.all()
        filtering = {
            'id': ALL,
            'members': ALL,
        }
