# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-02 15:49
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gm', '0030_character_member_of'),
    ]

    operations = [
        migrations.AddField(
            model_name='news',
            name='active',
            field=models.BooleanField(default=True, help_text='Uncheck to stop news EVER being shown'),
        ),
    ]
