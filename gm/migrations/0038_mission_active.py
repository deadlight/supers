# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-21 12:15
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gm', '0037_remove_mission_contact'),
    ]

    operations = [
        migrations.AddField(
            model_name='mission',
            name='active',
            field=models.BooleanField(default=False),
        ),
    ]
