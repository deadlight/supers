# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-13 21:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gm', '0012_character_registered'),
    ]

    operations = [
        migrations.AddField(
            model_name='stage',
            name='difficulty',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
    ]