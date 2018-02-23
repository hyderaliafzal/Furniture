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
  if (n === 'Monday') {

  }
});

let brandpayments = [];
findShop().then(shops => {
  if (shops.length > 0) {
    shops.map(shop => {
      for (let count = 0; count < 7; count++) {
        let date = moment().subtract(count, 'day').format('YYYY-M-DD').split('-');
        shopWiseBills(shop.id, date[2], date[1], date[0]).then(bills => {
          let billsCount = 0;
          if (bills.length > 0) {
            return new Promise(resolve => {
              let billsCount = 0;
              bills.map(bill => {
                let productCount = 0;
                return new Promise(resolve2 => {
                  bill._products.map(product => {
                    brandpayments.push({
                      shopId: shop.id,
                      brand: product.brand,
                      amount: parseInt(product.quantity) * parseInt(product.basePrice)});
                    productCount++;
                    if (productCount === bill._products.length) {
                      return resolve2();
                    }
                  });
                }).then(() => {
                  billsCount++;
                  if (billsCount === bills.length) {
                    return resolve();
                  }
                });
              });
            }).then(() => {
              let finalBPayment = [];
              return new Promise(resolve => {
                let count = 0;
                brandpayments.map(bpayment => {
                  if (finalBPayment.length === 0) {
                    finalBPayment.push(bpayment);
                  } else {
                    finalBPayment.map((fbp, index) => {
                      if (fbp.brand === bpayment.brand) {
                        finalBPayment[index].amount += parseInt(bpayment.amount);
                      } else {
                        finalBPayment.push(bpayment);
                      }
                    });
                  }
                  count++;
                  if (count === brandpayments.length) {
                    resolve();
                  }
                });
              }).then(() => {
                let date = d.toLocaleDateString().split('-');
                finalBPayment.day = date[2];
                finalBPayment.month = date[1];
                finalBPayment.year = date[0];
                console.log(finalBPayment, d.toLocaleDateString());
                /*models.BrandDues.create(finalBPayment, (err, res) => {

                });*/
              });
            });
          }
        });
      }
    });
  }
});
function findShop() {
  return new Promise((resolve, reject) => {
    models.Shop.find((err, shops) => {
      return resolve(shops);
    });
  });
}

function shopWiseBills(shopId, day, month, year) {
  return new Promise((resolve, reject) => {
    models.Bill.find({where:
          {shopId: shopId, day: day, month: month, year: year}},
      (err, bills) => {
        return resolve(bills);
      });
  });
}
