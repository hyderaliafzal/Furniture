'use strict';
var models = require('../server').models;

var schedule = require('node-schedule');
var d = new Date();
var weekday = new Array(7);
weekday[0] =  'Sunday';
weekday[1] = 'Monday';
weekday[2] = 'Tuesday';
weekday[3] = 'Wednesday';
weekday[4] = 'Thursday';
weekday[5] = 'Friday';
weekday[6] = 'Saturday';
var n = weekday[d.getDay()];
var j = schedule.scheduleJob('* * * 0 0 0', function() {
  var today = d.getDate();
  var days = [
    {day: d.getDate(), month: d.getMonth(), year: d.getFullYear()},
  ];
  let yesterday = new Date(today);
  for (let count = -1; count > -7; count--) {
    days.push({
      day: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
    });
  }
  console.log(days);

  models.Shop.find((err, shops) => {
    if (shops) {
      shops.map(shop => {
        let i;
        for (i = 0; i < 7; i++) {
          models.Bill.find({where: {shopId: shop.id, i}}, (err, bills) => {
            // console.log(bills);
          });
        }
      });
    }
  });
  if (n === 'Monday') {

  }
});
