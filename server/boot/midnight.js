'use strict';
var models = require('../server').models;
var moment = require('moment');
var schedule = require('node-schedule');
const each = require('async/each');
const _ = require('lodash');
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
  if (n === 'Monday') {
    return new Promise(resolve => {
      shopOne();
      resolve();
    }).then(() => {
      shopTwo();
    });
  }
});
shopOne();
function shopOne() {
  let brandpayments = [];
  let bills = [];
  let billProducts = [];
  let counter = [0, 1, 2, 3, 4, 5, 6];
  let finalPayments = [];
  each(counter, (count, next) => {
    let date = moment().subtract(count, 'day').format('YYYY-M-DD');
    date = date.split('-');
    models.Bill.find({where: {shopId: '5a83107bf56f6b2aab5b97ae', day: date[2],
      month: date[1], year: date[0]}},
      (err, bill) => {
        if (bill.length > 0) {
          bills.push(bill);
        }
        if (count === 6) {
          bills = _.flatMap(bills);
          let count = 1;
          each(bills, (bill, next2) => {
            billProducts.push(bill._products);
            if (count === bills.length) {
              next2();
            }
            count++;
          });
          billProducts = _.flatMap(billProducts);
          count = 1;
          each(billProducts, (product, next2) => {
            brandpayments.push({
              brand: product.brand,
              amount: parseInt(product.quantity) * parseInt(product.basePrice),
            });
            if (count === billProducts.length) {
              next2();
            }
            count++;
          });
          count = 1;
          each(brandpayments, (bpayment, next2) => {
            let date = d.toLocaleDateString().split('-');
            if (finalPayments.length === 0) {
              bpayment.day = date[2];
              bpayment.month = date[1];
              bpayment.year = date[0];
              bpayment.shopId = '5a83107bf56f6b2aab5b97ae';
              finalPayments.push(bpayment);
            } else {
              finalPayments.map((bp, index) => {
                if (bp.brand === bpayment.brand) {
                  finalPayments[index].amount += parseInt(bpayment.amount);
                } else {
                  bpayment.day = date[2];
                  bpayment.month = date[1];
                  bpayment.year = date[0];
                  bpayment.shopId = '5a83107bf56f6b2aab5b97ae';
                  finalPayments.push(bpayment);
                }
              });
            }
            if (count === brandpayments.length) {
              next2();
            }
            count++;
          });
          console.log(finalPayments, d.toLocaleDateString());
          let brands = [];
          finalPayments.map(b => {
            brands.push(b.brand);
          });
          console.log(brands);
          models.Product.find({where: {'shopId': '5a83107bf56f6b2aab5b97ae',
            brand: {inq: brands}}}, (err, res) => {
            console.log(res);
          });
          // models.BrandDues.create(finalPayments, (err, res) => {
          //   next();
          // });
        }
      });
  });
}

function shopTwo() {
  let brandpayments = [];
  let bills = [];
  let billProducts = [];
  let counter = [0, 1, 2, 3, 4, 5, 6];
  let finalPayments = [];
  each(counter, (count, next) => {
    let date = moment().subtract(count, 'day').format('YYYY-M-DD');
    date = date.split('-');
    models.Bill.find({where: {shopId: '5a83107bf56f6b2aab5b97af', day: date[2], month: date[1], year: date[0]}},
      (err, bill) => {
        if (bill.length > 0) {
          bills.push(bill);
        }
        if (count === 6) {
          bills = _.flatMap(bills);
          let count = 1;
          each(bills, (bill, next2) => {
            billProducts.push(bill._products);
            if (count === bills.length) {
              next2();
            }
            count++;
          });
          billProducts = _.flatMap(billProducts);
          count = 1;
          each(billProducts, (product, next2) => {
            brandpayments.push({
              brand: product.brand,
              amount: parseInt(product.quantity) * parseInt(product.basePrice),
            });
            if (count === billProducts.length) {
              next2();
            }
            count++;
          });
          count = 1;
          each(brandpayments, (bpayment, next2) => {
            let date = d.toLocaleDateString().split('-');
            if (finalPayments.length === 0) {
              bpayment.day = date[2];
              bpayment.month = date[1];
              bpayment.year = date[0];
              bpayment.shopId = '5a83107bf56f6b2aab5b97af';
              finalPayments.push(bpayment);
            } else {
              finalPayments.map((bp, index) => {
                if (bp.brand === bpayment.brand) {
                  finalPayments[index].amount += parseInt(bpayment.amount);
                } else {
                  bpayment.day = date[2];
                  bpayment.month = date[1];
                  bpayment.year = date[0];
                  bpayment.shopId = '5a83107bf56f6b2aab5b97af';
                  finalPayments.push(bpayment);
                }
              });
            }
            if (count === brandpayments.length) {
              next2();
            }
            count++;
          });
          console.log(finalPayments, d.toLocaleDateString());
          models.BrandDues.create(finalPayments, (err, res) => {
            next();
          });
          // next();
        }
      });
  });
}
/* findShop().then(shops => {
  shops.map(shop => {
    each(counter, (count, next) => {
      let date = moment().subtract(count, 'day').format('YYYY-M-DD').split('-');
      models.Bill.find({where:{shopId: shop.id, day: date[2], month: date[1], year: date[0]).then(bills => {
        if (bills.length > 0) {
          bills.map(bill => {
            billProducts.push(bill._products);
          });
        }
        if (count === 6) {
          console.log(shop.id, count, billProducts);
          next();
        }
      }).catch(e => console.log(e));
    });
  });
}).catch(e => console.log(e)); */
/* findShop().then(shops => {
  if (shops.length > 0) {
    shops.map(shop => {
      return new Promise(loop => {
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
              });
            }
          });
        }
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
          /!* models.BrandDues.create(finalBPayment, (err, res) => {

          }); *!/
        });
      });
    });
  }
}); */
function findShop() {
  return new Promise((resolve, reject) => {
    models.Shop.find((err, shops) => {
      return resolve(shops);
    });
  });
}

function shopWiseBills(shopId, day, month, year) {
  return new Promise((resolve, reject) => {
    models.Bill.find({where: {shopId: shopId}}, {day: day, month: month, year: year},
      (err, res) => {
        return resolve(res);
      });
  });
}

function billsScan(bills) {
  console.log('scanning bills');
  let brandProducts = [];
  return new Promise(resolve => {
    let count = 1;
    bills.map(bill => {
      brandProducts.push(bill._products);
      if (count === bills.length) {
        return resolve(brandProducts);
      }
      count++;
    });
  });
}
