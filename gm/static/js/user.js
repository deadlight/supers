var user = {};

//Get top teams
user.getTopTeams = function(listClass) {
  $('.' + listClass).load('/top-teams');
}

//Get top characters
user.getTopCharacters = function(listClass) {
  $('.' + listClass).load('/top-heroes');
}

//Get news - output into list of provided class
user.getNews = function(listClass) {
  $('.' + listClass).load('/news');
}

//Get character stats
user.getCharacter = function(characterId) {

}
