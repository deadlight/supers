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


class Mission(BaseModel):
    description = TextField(help_text="GM-only notes")
    claimed = BooleanField(help_text="Has this mission been started by a team")
    start_time = DateTimeField(null=True, blank=True)
    end_time = DateTimeField(null=True, blank=True)
    minutes_to_run = IntegerField(help_text="How long should the mission be available?")
    codeword = CharField(max_length=255, help_text="Secret code required for some missions", null=True, blank=True)
    contact = ManyToManyField(Contact)
    #TODO: ?mission "news" text


class Stage(BaseModel):
    description = TextField(
        help_text="GM-only notes"
    )
    mission = ForeignKey(Mission, related_name="stages")
    on_success = ForeignKey(
        "Stage",
        related_name="stage_on_success",
        help_text="The stage to trigger on success",
        blank=True,
        null=True)
    on_failure = ForeignKey("Stage", related_name="stage_on_failure", blank=True, null=True)
    #TODO: add: mission on failure
    #TODO: add: mission on success
    glory_on_success = IntegerField()
    glory_on_failure = IntegerField()
    start_stage = BooleanField()
    showdown = BooleanField()
    news_on_success = ManyToManyField("News", related_name="news_on_success")
    news_on_failure = ManyToManyField("News", related_name="news_on_failure")
    cooldown_on_success = IntegerField()
    cooldown_on_failure = IntegerField()
    difficulty = IntegerField()
    skills_needed = ManyToManyField("Skill", related_name="skills_needed")


class Character(BaseModel):
    """Characters."""
    player = CharField(max_length=255)
    glory = IntegerField(default=0)
    skills = ManyToManyField(Skill)
    contacts = ManyToManyField(Contact)
    cooldown = DateTimeField(blank=True, null=True)
    slug = CharField(max_length=255, null=True)
    registered = BooleanField(help_text="Is the super government registered")


class Team(BaseModel):
    members = ManyToManyField(Character, related_name="team_members")
    glory = IntegerField(default=0)


class News(BaseModel):
    contacts = ForeignKey(Contact)
    content = CharField(max_length=255, null=True)
    trigger_time = DateTimeField(blank=True, null=True)
