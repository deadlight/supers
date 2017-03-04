# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-04 11:14
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('gm', '0033_auto_20170302_1739'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='leader',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='leader', to='gm.Character'),
            preserve_default=False,
        ),
    ]
