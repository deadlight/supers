/* Admin functionality */
admin = {}

admin.mission = {}

admin.mission.selectedMission = {};
// admin.mission.stage = {};
admin.mission.team = [];

admin.mission.select = function() {
  var missionId = $('.select-mission').val();
  $.getJSON('/api/v1/mission/' + missionId + '/?format=json', function(data) {
    admin.mission.selectedMission = data;
    console.log('Mission selected: ' + admin.mission.selectedMission.name + ', ' +admin.mission.selectedMission.id );
    admin.mission.refreshMissionInfo();
    $(".missions").addClass('hide');
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

      if (requiredSkillMatch = $('.stage-' + stage + ' .needs-' + skill.id)) {
        characterSkillLine = $('<li>' + member.name + admin.mission.generateSkillCheckbox(member.id, skill.id) + '</li>');
        requiredSkillMatch.find('.required-skill-characters').append(characterSkillLine);
      }
    });
  });
}

admin.mission.generateSkillCheckbox = function(character, skill) {
  return '<input type="checkbox" class="usable-skill" data-character="' + character + '" data-skill="' + skill + '" onchange="admin.mission.skillChecked(this);" />';
}

admin.mission.skillChecked = function(checkBox) {
  if ($(checkBox).is(':checked')) {
    //Skill selected
    for (var characterKey in admin.mission.team) {
      if (admin.mission.team[characterKey].id == $(checkBox).data('character')) {
        for (var skillKey in admin.mission.team[characterKey].skills) {
          if (admin.mission.team[characterKey].skills[skillKey].id == $(checkBox).data('skill')) {
            admin.mission.team[characterKey].skills[skillKey].used = true;
            admin.mission.team[characterKey].missionGlory += 1;
            admin.mission.difficultyElement.data('difficultyCompleted', admin.mission.difficultyElement.data('difficultyCompleted')+1);
            admin.mission.updateDifficulty();
            admin.mission.refreshMissionInfo();
          }
        }
      }
    }
  } else {
    //Skill deselected
    for (var characterKey in admin.mission.team) {
      if (admin.mission.team[characterKey].id == $(checkBox).data('character')) {
        for (var skillKey in admin.mission.team[characterKey].skills) {
          if (admin.mission.team[characterKey].skills[skillKey].id == $(checkBox).data('skill')) {
            admin.mission.team[characterKey].skills[skillKey].used = false;
            admin.mission.team[characterKey].missionGlory -= 1;
            admin.mission.difficultyElement.data('difficultyCompleted', admin.mission.difficultyElement.data('difficultyCompleted')-1);
            admin.mission.updateDifficulty();
            admin.mission.refreshMissionInfo();
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

admin.mission.stagePassed = function(stageID) {
  //STAGE PASSED
  /*
    trigger news
    get next stage

    if last stage trigger mission passed
  */
}

admin.mission.stageFailed = function(stageID) {
  //STAGE PASSED
  /*
    trigger news
    get next stage

    if last stage trigger mission failed
  */
}

admin.mission.passed = function() {
  //MISSION PASSED!
  /*
    Save individual glory
    Calculate and save individual cooldowns
    Calculate and save team glory
    Deactivate mission
  */
}

admin.mission.failed = function() {
  //MISSION FAILED!
  /*
    Save individual glory
    Calculate and save individual cooldowns
    Calculate and save team glory
  */
}
