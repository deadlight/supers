var user = {};

//Get top teams
user.getTopTeams = function() {

}

//Get top characters
user.getTopCharacters = function() {

}

//Get news
user.getNews = function(channelParams) {
  $.getJSON('/api/v1/news/?format=json&', function() {

  });
}

//Get character stats
user.getCharacter = function(characterId) {

}
