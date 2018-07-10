const axios = require('axios');
const fs = require('fs');
const twilio = require('twilio');
const zlib = require('zlib');

const accountSid = 'YOUR TWILIO SID';
const authToken = 'YOUR TWILIO AUTHTOKEN';

var client = new twilio(accountSid, authToken);


const upComingChecker = () => {

	console.log("upcoming match checker is now running!");

	axios.get('https://api.fifa.com/api/v1/calendar/matches?idseason=254645&idcompetition=17&language=en-GB&count=100').then((res) => {

		var upcomingResults = res.data.Results.filter(function(resul) {

			return Date.parse(resul.LocalDate) > Date.now();

		});

		if(upcomingResults.length) {

			var team1 = upcomingResults[0].Home.TeamName[0].Description;
			var team2 = upcomingResults[0].Away.TeamName[0].Description;

			console.log(`Next upcoming match is between ${team1} and ${team2} on ${upcomingResults[0].LocalDate}`);

			var msg =  `Next match is between ${team1} and ${team2} on ${upcomingResults[0].LocalDate}`;

			sendSms(msg);

		} else {

			console.log('There are no upcoming matches');
		}

		logToFile(upcomingResults);

	}).catch((e) => {

		console.log(e);

	});

};

upComingChecker();

setInterval(function () {

	upComingChecker();	

}, 86400000);


const HourlyChecker = () => {

	console.log("Hourly checker is running");

	axios.get('https://api.fifa.com/api/v1/calendar/matches?idseason=254645&idcompetition=17&language=en-GB&count=100').then((res) => {
		
	var todayResults = res.data.Results.filter(function (resul) {

		d = new Date();
		d.setHours(5,30,0,0);

		dater = new Date(resul.LocalDate);
		dater = dater.setHours(0,0,0,0);

		return dater >= d;

	});

		logToFile(todayResults);

		if(todayResults.length > 0) {

			var team1 = todayResults[0].Home.TeamName[0].Description;
			var team2 = todayResults[0].Away.TeamName[0].Description;

			var HomeScore = todayResults[0].Home.Score == null ? '0' : todayResults[0].Home.Score;
			var AwayScore = todayResults[0].Away.Score == null ? '0' : todayResults[0].Away.Score;

			var message = `Today's match is between ${team1} and ${team2} and the current score is ${HomeScore}-${AwayScore}. Stay tuned`;
			console.log(message);
			sendSms(message);

			//console.log(todayResults[todayResults.length - 1]);

		}  else {

			console.log('There is no match going on right now!');
		}


	}).catch((e) => {

		console.log(e);

	});

}
	
HourlyChecker();

setInterval(function() {

	HourlyChecker();

}, 1000 * 60 * 60 * 60);

const sendSms = (msg) => {

	client.messages.create({

		body: msg,
		to: 'YOUR PHONE NUMBER',
		from: 'YOUR TWILIO PROVIDED PHONE NUMBER'

	}).then((message) => {

		console.log(message.sid);
	});

};

const logToFile = (data) => {


	fs.open('scores.json', 'a', function(err, fileDescriptor) {

		if(!err && fileDescriptor) {

			matchData = JSON.stringify(data);

			fs.write(fileDescriptor, matchData, function(err) {

				if(!err) {

					fs.close(fileDescriptor, function(err){

						if(!err) {	

							console.log('Done');

						} else {

							console.log('Error closing file');
						}
					});

				} else {

					console.log("Error writting to file");
				}

			});

		} else {

			console.log(err);
		}

	});


};