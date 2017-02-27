"""Game models."""
# flake8: noqa: E203,D211
from django.db.models import (
    Model,
    IntegerField,
    ForeignKey,
    CharField,
    ManyToManyField,
    TextField,
    BooleanField,
    DateTimeField,
)


class BaseModel(Model):
    """Shared attributes."""
    name = CharField(max_length=200)

    def __str__(self):
        return self.name

    class Meta:
        abstract = True


class Skill(BaseModel):
    """Characters' skills."""
    pass


class Contact(BaseModel):
    pass

class Location(BaseModel):
    pass

class Mission(BaseModel):
    description = TextField(help_text="GM-only notes")
    claimed = BooleanField(help_text="Has this mission been started by a team")
    start_time = DateTimeField(null=True, blank=True)
    end_time = DateTimeField(null=True, blank=True)
    minutes_to_run = IntegerField(help_text="How long should the mission be available?")
    codeword = CharField(max_length=255, help_text="Secret code required for some missions", null=True, blank=True)
    contact = ManyToManyField(Contact, blank=True)
    news_message = TextField(help_text="Mission info displayed in news feeds")
    on_success = ForeignKey(
        "Mission",
        related_name="mission_on_success",
        help_text="The mission to trigger on success",
        blank=True,
        null=True)
    on_success_delay = IntegerField(help_text="How long should mission on success be delayed", blank=True, null=True)
    on_failure = ForeignKey("Mission", related_name="mission_on_failure", blank=True, null=True)
    on_failure_delay = IntegerField(help_text="How long should mission on success be delayed", blank=True, null=True)
    location = ForeignKey("Location", related_name="mission_location", blank=True, null=True)
    repetitions = IntegerField(default=1, help_text="How many times can the mission be re-run. (To use this, the mission should trigger itself on success and/or failure)")



class Stage(BaseModel):
    description = TextField(help_text="GM-only notes", null=True, blank=True)
    mission = ForeignKey(Mission, related_name="stages")
    on_success = ForeignKey(
        "Stage",
        related_name="stage_on_success",
        help_text="The stage to trigger on success",
        blank=True,
        null=True)
    on_failure = ForeignKey("Stage", related_name="stage_on_failure", blank=True, null=True)
    # mission_if_failure = ForeignKey("Mission", related_name="mission_on_failure", blank=True, null=True)
    # mission_if_success = ForeignKey("Mission", related_name="mission_on_success", blank=True, null=True)
    glory_on_success = IntegerField()
    glory_on_failure = IntegerField()
    start_stage = BooleanField()
    showdown = BooleanField()
    news_on_success = ManyToManyField("News", related_name="news_on_success", blank=True)
    news_on_failure = ManyToManyField("News", related_name="news_on_failure", blank=True)
    cooldown_on_success = IntegerField(null=True, blank=True)
    cooldown_on_failure = IntegerField(null=True, blank=True)
    difficulty = IntegerField()
    skills_needed = ManyToManyField("Skill", related_name="skills_needed")
    success_message = TextField(null=True, blank=True)
    fail_message = TextField(null=True, blank=True)

class CharacterSkillLink(Model):
    skill = ForeignKey(Skill)
    character = ForeignKey('Character')

class Character(BaseModel):
    """Characters."""
    player = CharField(max_length=255)
    glory = IntegerField(default=0)
    contacts = ManyToManyField(Contact)
    cooldown = DateTimeField(blank=True, null=True)
    slug = CharField(max_length=255, null=True)
    registered = BooleanField(help_text="Is the super government registered")
    skills = ManyToManyField(Skill, through='CharacterSkillLink')

class Team(BaseModel):
    members = ManyToManyField(Character, related_name="team_members")
    glory = IntegerField(default=0)


class News(BaseModel):
    contacts = ForeignKey(Contact)
    content = CharField(max_length=255, null=True)
    trigger_time = DateTimeField(blank=True, null=True)
