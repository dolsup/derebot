var cheerio = require('cheerio');
var request = require('request');
var http = require('http');
var fs = require('fs');
require('colors');

var baseUrl = "http://vocaro.wikidot.com";
var songsUrl = "http://vocaro.wikidot.com/allsongs";
var songs = [];

var config = require('./config.json');
var Twitter = require('twitter');

var lastCrawlTime;
var lastLoadTime;
if(config.lastLoadTime) {
    lastLoadTime = config.lastLoadTime;
    lastCrawlTime = config.lastCrawlTime;
} else {
    config.lastLoadTime = lastLoadTime = new Date();
    config.lastCrawlTime = lastCrawlTime = new Date();
    syncClock();
}

function syncClock() {
    fs.writeFileSync(__dirname + '/config.json', JSON.stringify(config, null, '\t'));
}

var client = new Twitter({
    consumer_key: config.key,
    consumer_secret: config.secret,
    access_token_key: config.token.key,
    access_token_secret: config.token.secret
});

var params = {screen_name: 'vocaro_lyrics'};


/*
    참고
    https://dev.twitter.com/rest/reference/get/statuses/mentions_timeline

    https://api.twitter.com/1.1/statuses/mentions_timeline.json

트위터 멘션 조회 한 후..
마지막으로 크롤링 한 뒤 n시간이 지났다면 다시 크롤링
랜덤으로 뽑아서 답해주기
 
 * 마지막 크롤링 시간 기록
 

*/
var refreshTimer = setTimeout(loadMentions, 3600000);

function loadSongs(callback) {
    request(songsUrl, function(error, response, html) {
        if(error) throw error;
        $ = cheerio.load(html);
        songs = [];
        $('#page-content a').each(function(index, song) {
            console.log(("곡 "+ index).green, $(this).text(), (baseUrl+$(this).attr('href')).gray );
            songs.push([$(this).text(), $(this).attr('href')]);
        });
        config.lastCrawlTime = lastCrawlTime = new Date();
        syncClock();
        callback();
    });
}

function pickasong() {
    return songs[ Math.floor(Math.random()*songs.length) ];
}

function loadMentions() {
    client.get('application/rate_limit_status.json', {"resource": "statuses"}, function(error, body, response) {
        var rate = body.resources.statuses["/statuses/mentions_timeline"];
        console.log("멘션 뭐 왔나.. ".gray + rate.remaining + '/' + rate.limit, "RESET:" + (Number(rate.reset) - Number(Date.parse(new Date()))/1000) + "초" );
    });
    client.get('statuses/mentions_timeline', params, function(error, tweets, response){
        if (!error) {
            var requesters = [];
            for(var i = 0; i < tweets.length; i++) {
              if(Date.parse(tweets[i].created_at) > Date.parse(lastLoadTime)) {
                  console.log("멘션이당!!!!".green, tweets[i].user.screen_name + " : " + tweets[i].text);
                  if(tweets[i].text.indexOf("추천") != -1) {
                      requesters.push([tweets[i].user.screen_name, tweets[i].id_str]);
                      console.log("추천, 추천을 원하신다!!".red);
                  }
                  config.lastLoadTime = lastLoadTime = tweets[i].created_at;
              }
            }
            if(requesters.length > 0) {
                if(Date.parse(lastCrawlTime) + 3600000 < Date.parse(new Date()) || songs.length == 0) {
                    loadSongs(function() {
                      recommend(requesters);
                    });
                } else recommend(requesters);
            }
            syncClock();
        } else if(error[0].code == 88) {
            console.log("API 과열".red);
        }
    });
}

function recommend(requesters) {
    var selected;
    for(var i = 0; i < requesters.length; i++) {
        console.log(selected = pickasong());
        say("@"+requesters[i][0] + " 흐, 흥! <" + selected[0] + ">, " + baseUrl + selected[1] + "에 있으니까 보던가 말던가!", requesters[i][1]);
    }
}

function say(text, id2reply) {
    client.post('statuses/update', {status: text, in_reply_to_status_id: id2reply},  function(error, tweet, response){
      if(error) throw error;
      console.log("트윗".green, tweet); 
    });
}

loadSongs(function(){});
loadMentions();
console.log("BOT INIT".green);

setInterval(loadMentions, config.interval);




