const express = require('express');
const hbs = require('hbs');
const url = require('url');
const request = require('request');
const port = process.env.PORT || 3000;
const app = express();
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
	if(req.url !== '/'){
		const requestUrl = url.parse(req.url, true).query;
		const address = requestUrl.address;
		request({
			url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}`,
			json: true
			}, (error, response, body) => {
				if(error){
					res.res.render('not_found.hbs',{
						message : 'Unable To Connect To Google Server'
					});
				}
				else if(body.status === 'ZERO_RESULT') {
					res.res.render('not_found.hbs',{
						message : 'Unable To Find The Address'
					});
				}
				else if(body.status ==='OVER_QUERY_LIMIT'){
					res.render('not_found.hbs',{
						message : 'Over Query Limit Exceded'
					});
				}
				else if(body.status === 'OK'){
					var finalAddress = body.results[0].formatted_address;
					var finalLat = body.results[0].geometry.location.lat;
					var finalLng = body.results[0].geometry.location.lng;
					request({
						url: `https://api.darksky.net/forecast/794df7a196ae2ee2b423b95ef88a6b20/${finalLat},${finalLng}`,
						json: true
						},(error,response,body) => {
							if(!error&&response.statusCode === 200){
							res.render('result.hbs', {
								address: finalAddress,
								latitude: finalLat,
								longitude: finalLng,
								temperature: Math.round((5*(body.currently.temperature-32))/9),
								apparentTemperature: Math.round((5/9)*(body.currently.apparentTemperature-32)),
								humidity: body.currently.humidity,
								pressure: body.currently.pressure,
								summary: body.currently.summary,
								windSpeed: body.currently.windSpeed,
								cloudCover: body.currently.cloudCover,
								zone: body.timezone,
								daySummary : body.hourly.summary.toUpperCase()
							});
							
					} else
						res.send('<h1 style="text-align: center; padding-top: 100px">Unable to fetch data</h1>');
					});
				}
		});
		
	} else{
		res.render('home.hbs');
	}
});



app.listen(port, () => {
	console.log(`Server Running on PORT No. ${port}`);
});