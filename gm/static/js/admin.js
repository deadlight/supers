/* Admin functionality */
$.urlParam = function(name){
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results==null){
    return null;
  }
  else{
    return results[1] || 0;
  }
}

admin = {}

admin.mission = {}

admin.mission.selectedMission = {};
admin.mission.team = [];

admin.mission.glory = 0;

// Select the mission for the current run
admin.mission.select = function() {
  var missionId = $('.select-mission').val();
  admin.mission.setCurrentMission(missionId);
}

//check to see if the mission is pre-selectec in a URL param
admin.mission.checkMissionURLParam = function() {
  var id = $.urlParam('id');
  if ( id != null ) {
    admin.mission.setCurrentMission(id);
  }
}

//Set the mission to run
admin.mission.setCurrentMission = function(missionId) {
  $.getJSON('/api/v1/mission/' + missionId + '/?format=json', function(data) {
    admin.mission.selectedMission = data;
    console.log('Mission selected: ' + admin.mission.selectedMission.name + ', ' +admin.mission.selectedMission.id );
    admin.mission.refreshMissionInfo();
    $(".missions").addClass('hide');
    $.get('/admin/claim-mission/' + missionId);
    admin.mission.won = false;
    admin.mission.chooseTeam();
  });
}

// Show the team choosing form
admin.mission.chooseTeam = function() {
  $(".team").removeClass('hide');
  admin.mission.refreshMissionInfo();
}

// Add character to the mission team by ID
admin.mission.addTeamMember = function(characterId) {
  $.getJSON('/api/v1/character/' + characterId + '/?format=json', function(data) {
    $(".select-team-member option[value=" + characterId + "]").remove();
    data.missionGlory = 0;
    admin.mission.team.push(data);
    console.log('Character ' + data.name + ' added to mission team');
    admin.mission.refreshMissionInfo();
  });
}

// Start the selected mission with selected team
admin.mission.startMission = function() {
  //Get the bonus stage if it exists
  admin.mission.selectedMission.bonus = null;
  $.getJSON('/api/v1/stage/?format=json&mission=' + admin.mission.selectedMission.id + '&bonus=true', function(data) {
    if (data.objects[0].id) {
      admin.mission.selectedMission.bonus = data.objects[0].id;
      admin.mission.refreshMissionInfo();
    }
  });

  console.log('Mission ' + admin.mission.selectedMission.id + ' started');
  $.getJSON('/api/v1/stage/?format=json&mission=' + admin.mission.selectedMission.id + '&start_stage=true', function(data) {
    admin.mission.startStage(data.objects[0].id);
    $(".team").addClass('hide');
    admin.mission.refreshMissionInfo();
  });
}

//load the form for a mission stage by stage id
admin.mission.startStage = function(stageId) {
  $('.stages').load("/admin/stage/" + stageId, function(){
    admin.mission.showCharactersWithSkills(stageId);
    admin.mission.updateDifficulty(stageId);
  });
}

// Check if the stage's difficulty level has been met and update the buttons
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

// Check if mission team characters have the requisite skills and provide inputs when they do
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

// return the HTML for a checkbox for a skill use selecter
admin.mission.generateSkillCheckbox = function(character, skill, skillNumber) {
  return '<input type="checkbox" class="usable-skill" data-character="' + character + '" data-skill="' + skill + '" data-skill-number="' + skillNumber + '" onchange="admin.mission.skillChecked(this);" />';
}

// handle when a skill use selected is checked/unchecked
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

// Refresh the mission info panel
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
      memberGlory = $('<p class="member-glory">Mission glory: <button class="fudge" onclick="admin.mission.updateGlory(' + member.id + ',-1);">-1</button><span class="' + member.id + '">' + member.missionGlory + '</span><button class="fudge" onclick="admin.mission.updateGlory( ' + member.id + ',1);">+1</button></p>');
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

// Update a character's running glory total for skill use
admin.mission.updateGlory = function(memberID, modifier) {
  $.each(admin.mission.team, function(key, member) {
    if (member.id == memberID) {
      member.missionGlory = member.missionGlory + modifier;
    }
  });
  admin.mission.refreshMissionInfo();
}

// Update the glory running total for participation
admin.mission.updateMissionGlory = function(glory) {
  admin.mission.glory += glory;
  admin.mission.refreshMissionInfo();
}

// Handle a stage being passed
admin.mission.handleStagePassed = function(stageID) {
  $.getJSON('/api/v1/stage/?format=json&id=' + stageID , function(data) {
    if (data.objects[0].news_on_success != null) {
      admin.triggerNews(data.objects[0].news_on_success);
    }

    admin.mission.updateMissionGlory(data.objects[0].glory_on_success);

    if (data.objects[0].on_success != null) {
      $.getJSON(data.objects[0].on_success, function(nextData) {
        admin.mission.startStage(nextData.id);
      });
    } else {
      admin.mission.won = true;
      //check for bonus!
      console.log('checking for bonus');
      if (admin.mission.selectedMission.bonus == null) {
        //No bonus mission, just pass the mission

        console.log('No bonus');
        admin.mission.passed();
      } else {
        //Offer bonus mission
        console.log('Bonus');
        $('.stages').load("/admin/offer-bonus/" + admin.mission.selectedMission.bonus, function(){
          //remove the bonus flag
          admin.mission.selectedMission.bonus = null;
        });
      }
    }
  });
}

// display stage passed message
admin.mission.stagePassed = function(stageID) {
  $.getJSON('/api/v1/stage/?format=json&id=' + stageID , function(data) {
    if (data.objects[0].success_message !== undefined) {
      //display message
      message = $('<h1 class="title">Stage passed</h1><p>' + data.objects[0].success_message + '</p><p><button onclick="admin.mission.handleStagePassed(' + stageID + ');">Continue</button>');
      $('.stages').html(message);
    } else {
      // no message
      admin.mission.handleStagePassed(stageID);
    }
  });
}

// handle a stage being failed
admin.mission.handleStageFailed = function(stageID) {
  $.getJSON('/api/v1/stage/?format=json&id=' + stageID , function(data) {
    if (data.objects[0].news_on_failure != null) {
      admin.triggerNews(data.objects[0].news_on_failure);
    }

    admin.mission.updateMissionGlory(data.objects[0].glory_on_failure);

    if (data.objects[0].on_failure != null) {
      $.getJSON(data.objects[0].on_failure, function(nextData) {
        admin.mission.startStage(nextData.id);
      });
    } else {
      admin.mission.failed();
    }
  });
}

// display stage failed message
admin.mission.stageFailed = function(stageID) {
  $.getJSON('/api/v1/stage/?format=json&id=' + stageID , function(data) {
    if (data.objects[0].failure_message !== undefined) {
      //display message
      message = $('<h1 class="title">Stage failed</h1><p>' + data.objects[0].failure_message + '</p><p><button onclick="admin.mission.handleStageFailed(' + stageID + ');">Continue</button>');
      $('.stages').html(message);
    } else {
      // no message
      admin.mission.handleStageFailed(stageID);
    }
  });
}

// Handle a mission being passed
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
      $('.team-' + id).keyup(function(){
        team.missionGlory = $(this).val();
        $('.team-' + id).val = team.missionGlory;
      });
    });
  });
}

// Handle a mission failure
admin.mission.failed = function() {
  if (admin.mission.won == true) {
    admin.mission.passed();
  } else {
    console.log('MISSION FAILED!');
    $('.stages').load("/admin/fail-mission", function(){
      admin.mission.heroTeams = {};

      // show characters' glory (participation glory + powers used glory) ONLY NEGATIVES!
      var characterSummary = $('.mission-failed .characters');
      $.each(admin.mission.team, function(key, member) {
        member.participationGlory = admin.mission.glory < 0 ? admin.mission.glory : 0;
        if (member.missionGlory >= 0) {
          member.missionGlory = 0;
        }
        var totalGlory = member.missionGlory + member.participationGlory ;

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

        //If the member is in a team minus 1 from that team's score
        if (!member.team.length == 0) {
          //Member is in a team
          if (member.team[0].id in admin.mission.heroTeams) {
            //An entry for this team already exists
            admin.mission.heroTeams[member.team[0].id].missionGlory--;
          } else {
            //There is no entry for this team
            admin.mission.heroTeams[member.team[0].id] = {
              'name': member.team[0].name,
              'missionGlory': -1
            }
          }
        }
      });

      // show teams' glory
      $.each(admin.mission.heroTeams, function(id, team) {
        $('.mission-failed .teams').append('<p>' + team.name + ' <input type="text" class="team-' + id + '-glory" value="' + team.missionGlory + '" /></p>');
        $('.team-' + id).keyup(function(){
          team.missionGlory = $(this).val();
          $('.team-' + id).val = team.missionGlory;
        });
      });
    });
  }
}

// Save the outcomes and trigger events on a mission conclusion
admin.mission.saveResult = function(success) {
  //Save individual glory & cooldown
  $.each(admin.mission.team, function(key, member) {
    //Save glory
    missionTotal = member.missionGlory + member.participationGlory;
    if (success == true || missionTotal < 0) {
      $.get('/admin/update-character-glory/' + member.id + '/' + missionTotal);
    }

    //Save cooldown
    $.getJSON('/api/v1/stage/?format=json&id=' + admin.mission.currentStage, function(data) {

      cooldownToSave = 15;

      if (success == true) {
        //get cooldown on success
        if ($.isNumeric(data.cooldown_on_success)) {
          cooldownToSave = data.cooldown_on_success;
        }
      } else {
        //get cooldown on failure
        if ($.isNumeric(data.cooldown_on_failure)) {
          cooldownToSave = data.cooldown_on_failure;
        }
      }

      playerCooldown = cooldownToSave;
      $.each(member.skills, function(key, skill) {
        //if member has super speed or flight
        if (skill.name == 'Super Speed' || skill.name == 'Flight') {
          playerCooldown -= 5;
        }
      });

      //save cooldown
      $.get('/admin/update-character-cooldown/' + member.id + '/' + playerCooldown);
    });
  });

  //save team glory (positive only if mission is successful)
  $.each(admin.mission.heroTeams, function(key, team) {
    //Save glory
    missionTotal = team.missionGlory;
    if (success == true || missionTotal < 0) {
      $.get('/admin/update-team-glory/' + key + '/' + missionTotal);
    }
  });

  // unclaim mission
  $.get('/admin/unclaim-mission/' + admin.mission.selectedMission.id);

  //trigger missions on success/failure and end mission
  missionToTrigger = null;
  missionDelay = 0;
  if (success == true) {
    if (admin.mission.selectedMission.on_success != null) {
      missionToTrigger = admin.mission.selectedMission.on_success;
    }
  } else {
    if (admin.mission.selectedMission.on_failure != null) {
      missionToTrigger = admin.mission.selectedMission.on_failure;
    }
  }

  if (missionToTrigger == null) {
    //unclaim and refresh page
    $.get('/admin/unclaim-mission/' + admin.mission.selectedMission.id, function(){
      location.reload();
    });
  } else {
    //trigger mission
    $.getJSON(missionToTrigger, function(data) {
      $.get('/admin/trigger-mission/' + data.id, function() {
        //unclaim and refresh page
        $.get('/admin/unclaim-mission/' + admin.mission.selectedMission.id, function(){
          location.reload();
        });
      });
    });
  }
}

// cancel and reset current mission
admin.mission.cancel = function() {
  if (!$.isEmptyObject(admin.mission.selectedMission)) {
    $.get('/admin/unclaim-mission/' + admin.mission.selectedMission.id, function(){
      location = location.href.replace(location.search, "");
    });
  } else {
    location.reload();
  }
}

// set a news item to appear
admin.triggerNews = function(newsURL) {
  console.log('Trigger news')
  $.getJSON(newsURL, function(data){
    console.log('working')
    $.get('/admin/trigger-news/' + data.id);
  });
}

admin.triggerNewsById = function(id) {
  $.get('/admin/trigger-news/' + id);
}

admin.activateNews = function(id, time) {
  $.get('/admin/activate-news/' + id + '/' + time);
}

admin.deactivateNews = function(id) {
  $.get('/admin/deactivate-news/' + id);
}

// Register superior
admin.registerSuperior = function(id) {
  $.get('/admin/register/' + id, function(){
    alert(id + ' registered');
  });
}

// Unregister superior
admin.unregisterSuperior = function(id) {
  $.get('/admin/unregister/' + id, function(){
    alert(id + ' unregistered');
  });
}

admin.wipeCooldown = function(id) {
  $.get('/admin/update-character-cooldown/' + id + '/0', function() {
    alert('player ' + id + ' cooldown reset');
  });
}

admin.unclaimMission = function(id){
  $.get('/admin/unclaim-mission/' + id, function(){

  });
};

admin.activateMission = function(id){
  $.get('/admin/activate-mission/' + id, function(){
    location.reload();
  });
};

admin.deactivateMission = function(id){
  $.get('/admin/deactivate-mission/' + id, function(){
      location.reload();
  });
};

admin.activateCharacter = function(id){
  $.get('/admin/activate-character/' + id, function(){
    location.reload();
  });
};

admin.deactivateCharacter = function(id){
  $.get('/admin/deactivate-character/' + id, function(){
      location.reload();
  });
};

admin.updateCharacterGlory = function(characterId, modifier){
  $.get('/admin/update-character-glory/' + characterId + '/' + modifier, function(){
    location.reload();
  });
}
