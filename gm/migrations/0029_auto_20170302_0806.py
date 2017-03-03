# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-02 08:06
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('gm', '0028_remove_team_members'),
    ]

    operations = [
        migrations.CreateModel(
            name='TeamCharacterLink',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('member', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gm.Character')),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gm.Team')),
            ],
        ),
        migrations.AddField(
            model_name='team',
            name='members',
            field=models.ManyToManyField(through='gm.TeamCharacterLink', to='gm.Character'),
        ),
    ]