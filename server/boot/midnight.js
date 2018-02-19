'use strict';
var models = require('../server').models;
var moment = require('moment');
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
var j = schedule.scheduleJob('* * * * * *', function() {
  let brandpeyments = [];
  models.Shop.find({}, (err, shops) => {
    if (shops) {
      shops.map(shop => {
        for (let count = 0; count < 7; count++) {
          let date = moment().subtract(count, 'day').format('YYYY-M-DD').split('-');
          console.log(shop.id, date);
          models.Bill.find({where: {shopId: shop.id, day: date[2], month: date[1], year: date[0]}},
            (err, bills) => {
              console.log(bills);
            });
        }
      });
    }
  });
  if (n === 'Monday') {

  }
});

