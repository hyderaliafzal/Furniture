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
  let brandpayments = [];
  /*findShop().then(shops => {
    if (shops.length > 0) {
      shops.map(shop => {
        for (let count = 0; count < 7; count++) {
          let date = moment().subtract(count, 'day').format('YYYY-M-DD').split('-');
          shopWiseBills(shop.id, date[2], date[1], date[0])
            .then(bills => {
              // brandpayments;
              return new Promise(bills.map(bill => {
                // brandpayments.push({shopId: bill.shopId, bill.brand})
              })).then(() => {

              })
            });
        }
      });
    }
  });*/
  /* models.Shop.find({}, (err, shops) => {
    if (shops) {
      shops.map(shop => {
        for (let count = 0; count < 7; count++) {
          let date = moment().subtract(count, 'day').format('YYYY-M-DD').split('-');
          console.log(shop.id, date);
          models.Bill.find({where: {shopId: shop.id, day: date[2], month: date[1], year: date[0]}},
            (err, bills) => {
              if (bills.length > 0) {
                bills.map(bill => {
                  if (brandpayments.length === 0) {
                    let basePrice = 0;
                    bill._products.map(p=> {
                      basePrice = parseInt(p.basePrice) * parseInt(p.quantity);
                      return brandpayments.push({
                        brand: p.brandName,
                        shopId: shop.id,
                        day: date[2],
                        month: date[1],
                        year: date[0],
                        basePrice: basePrice,
                      });
                      console.log(brandpayments);
                    });
                  }
                });
              }
            });
        }
      });
    }
  }); */
  if (n === 'Monday') {

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
    models.Bills.find({shopId: shopId, day: day, month: month, year: year},
      (err, bills) => {
        return resolve(bills);
      });
  });
}

function amountCalculation(shopId, bills) {
  return Promise.all([billScan(bills)]).then(result => {
    return result;
  });
}

function billScan(bills) {
  return new Promise(resolve => {
    bills.map(bill => {
      resolve(productBrandMap(bill._products));
    });
  });
}

function productBrandMap(shopId, products) {
  return new Promise(resolve => {
    products.map(product => {
      resolve(brandProductCalculation(shopId, product));
    });
  });
}

function brandProductCalculation(shopId, product) {
  return new Promise(resolve => {
    console.log(product);
    resolve({shopId, brand: product.brandName,
      basePrice: (product.quantity * product.basePrice)});
  });
}
