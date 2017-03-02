/* Admin functionality */
admin = {}

admin.mission = {}

admin.mission.selectedMission = {};
// admin.mission.stage = {};
admin.mission.team = [];

admin.mission.glory = 0;

admin.mission.select = function() {
  var missionId = $('.select-mission').val();
  $.getJSON('/api/v1/mission/' + missionId + '/?format=json', function(data) {
    admin.mission.selectedMission = data;
    console.log('Mission selected: ' + admin.mission.selectedMission.name + ', ' +admin.mission.selectedMission.id );
    admin.mission.refreshMissionInfo();
    $(".missions").addClass('hide');
    //$.get('/admin/claim-mission/' + missionId);
    admin.mission.chooseTeam();
  });
}

admin.mission.chooseTeam = function() {
  $(".team").removeClass('hide');
  admin.mission.refreshMissionInfo();
}

admin.mission.addTeamMember = function(characterId) {
  $.getJSON('/api/v1/character/' + characterId + '/?format=json', function(data) {
    $(".select-team-member option[value=" + characterId + "]").remove();
    data.missionGlory = 0;
    admin.mission.team.push(data);
    console.log('Character ' + data.name + ' added to mission team');
    admin.mission.refreshMissionInfo();
  });
}

admin.mission.startMission = function() {
  console.log('Mission ' + admin.mission.selectedMission.id + ' started');
  $.getJSON('/api/v1/stage/?format=json&mission=' + admin.mission.selectedMission.id + '&start_stage=true', function(data) {
    admin.mission.startStage(data.objects[0].id);
    $(".team").addClass('hide');
    admin.mission.refreshMissionInfo();
  });
}

admin.mission.startStage = function(stageId) {
  $('.stages').load("/admin/stage/" + stageId, function(){
    admin.mission.showCharactersWithSkills(stageId);
    admin.mission.updateDifficulty(stageId);
  });
}

admin.mission.updateDifficulty = function(stageID) {
  if ((typeof stageID !== 'undefined')) {
    difficultyElement = $('.stage-' + stageID + '-difficulty');
    admin.mission.difficultyElement = difficultyElement;
    admin.mission.currentStage = stageID;
  }
  console.log('Difficulty: ' + admin.mission.difficultyElement.data('difficulty'));
  console.log('Difficulty completed: ' + admin.mission.difficultyElement.data('difficultyCompleted'));
  admin.mission.difficultyElement.find('.current').text(admin.mission.difficultyElement.data('difficultyCompleted'));
  admin.mission.difficultyElement.find('.required').text(admin.mission.difficultyElement.data('difficulty'));

  if (admin.mission.difficultyElement.data('difficultyCompleted') >= admin.mission.difficultyElement.data('difficulty')) {
    $('.stage-' + admin.mission.currentStage + ' .failed').addClass('disabled');
    $('.stage-' + admin.mission.currentStage + ' .passed').removeClass('disabled');
  } else {
    $('.stage-' + admin.mission.currentStage + ' .failed').removeClass('disabled');
    $('.stage-' + admin.mission.currentStage + ' .passed').addClass('disabled');
  }
}

admin.mission.showCharactersWithSkills = function(stage) {
  // Put character names and checkboxes next to the stage's required skills
  $.each(admin.mission.team, function(key, member) {
    $.each(member.skills, function(key, skill) {
      if (skill.used == false) {
        if (requiredSkillMatch = $('.stage-' + stage + ' .needs-' + skill.id)) {
          characterSkillLine = $('<li>' + member.name + admin.mission.generateSkillCheckbox(member.id, skill.id, key) + '</li>');
          requiredSkillMatch.find('.required-skill-characters').append(characterSkillLine);
        }
      }
    });
  });
}

admin.mission.generateSkillCheckbox = function(character, skill, skillNumber) {
  return '<input type="checkbox" class="usable-skill" data-character="' + character + '" data-skill="' + skill + '" data-skill-number="' + skillNumber + '" onchange="admin.mission.skillChecked(this);" />';
}

admin.mission.skillChecked = function(checkBox) {
  if ($(checkBox).is(':checked')) {
    //Skill selected
    for (var characterKey in admin.mission.team) {
      if (admin.mission.team[characterKey].id == $(checkBox).data('character')) {
        for (var skillKey in admin.mission.team[characterKey].skills) {
          if ((admin.mission.team[characterKey].skills[skillKey].id == $(checkBox).data('skill')) && (admin.mission.team[characterKey].skills[skillKey].used != true)) {
            admin.mission.team[characterKey].skills[skillKey].used = true;
            admin.mission.team[characterKey].missionGlory += 1;
            admin.mission.difficultyElement.data('difficultyCompleted', admin.mission.difficultyElement.data('difficultyCompleted')+1);
            admin.mission.updateDifficulty();
            admin.mission.refreshMissionInfo();
            break;
          }
        }
      }
    }
  } else {
    //Skill deselected
    for (var characterKey in admin.mission.team) {
      if (admin.mission.team[characterKey].id == $(checkBox).data('character')) {
        for (var skillKey in admin.mission.team[characterKey].skills) {
          if ((admin.mission.team[characterKey].skills[skillKey].id == $(checkBox).data('skill')) && (admin.mission.team[characterKey].skills[skillKey].used != false)) {
            admin.mission.team[characterKey].skills[skillKey].used = false;
            admin.mission.team[characterKey].missionGlory -= 1;
            admin.mission.difficultyElement.data('difficultyCompleted', admin.mission.difficultyElement.data('difficultyCompleted')-1);
            admin.mission.updateDifficulty();
            admin.mission.refreshMissionInfo();
            break;
          }
        }
      }
    }
  }
}

admin.mission.refreshMissionInfo = function() {
  // Update mission name
  if (!$.isEmptyObject(admin.mission.selectedMission)) {
    $('.mission-info-name').text(admin.mission.selectedMission.name);
  }

  //Update mission glory
  $('.mission-glory').text(admin.mission.glory);

  //Update team list
  infoMembers = $('.info-members');
  infoMembers.empty();
  if (!$.isEmptyObject(admin.mission.team)) {
    $.each(admin.mission.team, function(key, member) {
      memberItem = $('<li></li>');
      memberItem.addClass('mission-info-team-member');
      memberItem.text(member.name);
      memberGlory = $('<p class="member-glory">Mission glory: <button onclick="admin.mission.updateGlory(' + member.id + ',-1);">-1</button><span class="' + member.id + '">' + member.missionGlory + '</span><button onclick="admin.mission.updateGlory( ' + member.id + ',1);">+1</button></p>');
      memberItem.append(memberGlory);
      skillsList = $('<ul></ul>');
      $.each(member.skills, function(key, skill) {
        if (skill.used == undefined) {
          skill.used = false;
        }
        skillClass = skill.used?'used':'';
        skillsList.append('<li class="' + skillClass + '">' + skill.name + '</li>');
      });
      memberItem.append(skillsList);
      infoMembers.append(memberItem);
    });
  }
}

admin.mission.updateGlory = function(memberID, modifier) {
  $.each(admin.mission.team, function(key, member) {
    if (member.id == memberID) {
      member.missionGlory = member.missionGlory + modifier;
    }
  });
  admin.mission.refreshMissionInfo();
}

admin.mission.updateMissionGlory = function(glory) {
  admin.mission.glory += glory;
  admin.mission.refreshMissionInfo();
}

admin.mission.stagePassed = function(stageID) {
  //TODO: stage passed message!
  alert('STAGE PASSED INFO');
  $.getJSON('/api/v1/stage/?format=json&id=' + stageID , function(data) {
    if (data.objects[0].news_on_success != null) {
      admin.triggerNews(data.objects[0].news_on_success);
      admin.mission.updateMissionGlory(data.objects[0].glory_on_success);
    }

    if (data.objects[0].on_success != null) {
      $.getJSON(data.objects[0].on_success, function(nextData) {
        admin.mission.startStage(nextData.id);
      });
    } else {
      admin.mission.passed();
    }
  });
}

admin.mission.stageFailed = function(stageID) {
  //TODO: stage passed message!
  alert('STAGE FAILED INFO')
  $.getJSON('/api/v1/stage/?format=json&id=' + stageID , function(data) {
    if (data.objects[0].news_on_failure != null) {
      admin.triggerNews(data.objects[0].news_on_failure);
    }

    if (data.objects[0].on_failure != null) {
      $.getJSON(data.objects[0].on_failure, function(nextData) {
        admin.mission.startStage(nextData.id);
      });
    } else {
      admin.mission.failed();
    }
  });
}

admin.mission.passed = function() {
  console.log('MISSION PASSED!');
  $('.stages').load("/admin/pass-mission", function(){
    admin.mission.heroTeams = {};

    // show characters' glory (participation glory + powers used glory)
    var characterSummary = $('.mission-passed .characters');
    $.each(admin.mission.team, function(key, member) {
      member.participationGlory = admin.mission.glory;
      var totalGlory = member.missionGlory + member.participationGlory;

      var characterItem = $('<p></p>');
      characterItem.append(member.name);
      var missionGloryElement = $('<input data-id="' + member.id + '" type="text" class="skill-glory-' + member.id +'" value="' + member.missionGlory + '" />');

      var participationGloryElement = $('<input data-id="' + member.id + '" type="text" class="participation-glory-' + member.id + '" value="' + member.participationGlory + '" />');

      characterItem.append(missionGloryElement);
      characterItem.append(' + ');
      characterItem.append(participationGloryElement);
      characterItem.append(' = <span class="total-glory-' + member.id + '">' + totalGlory + '</span>');
      characterSummary.append(characterItem);

      $('.skill-glory-' + member.id).keyup(function(){
        member.missionGlory = $(this).val();
        $('.total-glory-' + member.id).text(Number(member.missionGlory) + Number(member.participationGlory));
      });

      $('.participation-glory-' + member.id).keyup(function(){
        member.participationGlory = $(this).val();
        $('.total-glory-' + member.id).text(Number(member.missionGlory) + Number(member.participationGlory));
      });

      //If the member is in a team add 1 to that team's score
      if (!member.team.length == 0) {
        //Member is in a team
        if (member.team[0].id in admin.mission.heroTeams) {
          //An entry for this team already exists
          admin.mission.heroTeams[member.team[0].id].missionGlory++;
        } else {
          //There is no entry for this team
          admin.mission.heroTeams[member.team[0].id] = {
            'name': member.team[0].name,
            'missionGlory': 1
          }
        }
      }
    });

    // show teams' glory
    $.each(admin.mission.heroTeams, function(id, team) {
      $('.mission-passed .teams').append('<p>' + team.name + ' <input type="text" class="team-' + id + '-glory" value="' + team.missionGlory + '" /></p>');
    });
  });
}

admin.mission.saveResult = function(success) {
  //Save individual glory & cooldown
  $.each(admin.mission.team, function(key, member) {
    //Save glory
    newTotal = member.missionGlory + member.participationGlory;
    if (success == true || newTotal < 0) {
      $.get('/admin/update-character-glory/' + member.id + '/' + newTotal);
    }

    //Save cooldown
    //if member has super speed or flight
      // reduced cooldown
    // else
      //normal cooldown

    if (success == true) {
      $.getJSON('/api/v1/stage/?format=json&id=' + admin.mission.currentStage, function(data) {
        console.log(data.)
      });
    } else {

    }
  });

  // save team glory (positive only if mission is successful)

  // reduce mission repetitions by 1 if mission success

  // unclaim mission
  $.get('/admin/unclaim-mission/' + admin.mission.selectedMission.id);

  // trigger missions on success/failure (with delay!)

  // trigger news! success / fail
}

admin.mission.failed = function() {
  console.log('MISSION FAILED!');
  alert('MISSION FAILED');
}

admin.triggerNews = function(newsURL) {
  console.log('Trigger news')
}
