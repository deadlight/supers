# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-02 17:39
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('gm', '0032_auto_20170302_1734'),
    ]

    operations = [
        migrations.AlterField(
            model_name='character',
            name='cooldown',
            field=models.DateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
    ]