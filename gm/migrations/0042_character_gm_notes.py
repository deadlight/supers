# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-25 14:31
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gm', '0041_remove_mission_repetitions'),
    ]

    operations = [
        migrations.AddField(
            model_name='character',
            name='gm_notes',
            field=models.TextField(blank=True, help_text='GM-only notes, not seen by player', null=True),
        ),
    ]