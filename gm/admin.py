from django.contrib import admin
from django import forms
from django.contrib import messages
from django.core.exceptions import ValidationError

from .models import (
    Character,
    Skill,
    Contact,
    Stage,
    Team,
    News,
    Mission,
    CharacterSkillLink,
    Location,
    TeamCharacterLink,
)

class CharacterInline(admin.TabularInline):
    model = CharacterSkillLink
    extra = 3

class CharacterTeamInline(admin.TabularInline):
    model = TeamCharacterLink
    extra = 3

class CharacterAdmin(admin.ModelAdmin):
    inlines = (CharacterInline  ,)

class StageInline(admin.StackedInline):
    model = Stage
    extra = 0

class LocationAdmin(admin.ModelAdmin):
    pass

class MissionAdminForm(forms.ModelForm):

    def clean(self):
        # raise ValidationError("SKILL VALIDATION ERROR")
        stage_skills_needed_keys = [
            k for k
            in self.data.copy().keys()
            if "skills_needed" in k
        ]

        stage_current_chars_keys = [
            k for k
            in self.data.copy().keys()
            if "current_characters" in k
        ]

        for stage_id, _ in enumerate(stage_current_chars_keys):
            # stage 0
            skills_needed_ids = self.data.copy().pop(
                    'stages-%s-skills_needed' % stage_id,
                    []
            )
            character_ids = self.data.copy().pop(
                    'stages-%s-current_characters' % stage_id,
                    []
            )
            characters = Character.objects.filter(
                id__in=character_ids
            )
            stage_skills = Skill.objects.filter(
                id__in=skills_needed_ids
            )
            stage_skills = set([s.name for s in stage_skills])

            if characters:
                group_skills = set()
                for character in characters:
                    group_skills.update(
                        [s.name for s in character.skills.all()]
                    )
                if stage_skills.issubset(group_skills):
                    pass
                else:
                    raise ValidationError("SKILL VALIDATION ERROR")


class MissionAdmin(admin.ModelAdmin):
    inlines = [
        StageInline,
    ]
    form = MissionAdminForm


class SkillAdmin(admin.ModelAdmin):
    pass


class ContactAdmin(admin.ModelAdmin):
    pass

class StageAdmin(admin.ModelAdmin):
    pass


class TeamAdmin(admin.ModelAdmin):
    inlines = (CharacterTeamInline  ,)


class MissionGroupAdmin(admin.ModelAdmin):
    pass


class NewsAdmin(admin.ModelAdmin):
    pass


admin.site.register(Character, CharacterAdmin)
admin.site.register(Skill, SkillAdmin)
admin.site.register(Contact, ContactAdmin)
admin.site.register(Stage, StageAdmin)
admin.site.register(Team, TeamAdmin)
admin.site.register(News, NewsAdmin)
admin.site.register(Mission, MissionAdmin)
admin.site.register(Location, LocationAdmin)
