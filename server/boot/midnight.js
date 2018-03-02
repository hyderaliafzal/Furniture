'use strict';
var models = require('../server').models;
var moment = require('moment');
var schedule = require('node-schedule');
const each = require('async/each');
const _ = require('lodash');
const {map} = require('lodash');
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
var j = schedule.scheduleJob({hour: 0, minute: 1}, function() {
  if (n === 'Monday') {
    return new Promise(resolve => {
      shopOne();
      resolve();
    }).then(() => {
      shopTwo();
    });
  }
});
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
          billProducts = _.map(bills, bill => bill._products);
          billProducts = _.flatMap(billProducts);
          billProducts.map(product => {
            brandpayments.push({
              shopId: '5a83107bf56f6b2aab5b97ae',
              brand: product.brand,
              amount: parseInt(product.quantity) * parseInt(product.basePrice),
              remaining: 0,
            });
          });
          brandpayments.map((bp, index) => {
            let date = d.toLocaleDateString().split('-');
            if (finalPayments.length < 1) {
              bp.day = date[2];
              bp.month = date[1];
              bp.year = date[0];
              bp.shopId = '5a83107bf56f6b2aab5b97ae';
              // bp.remaining = 0;
              finalPayments.push(bp);
            }
            finalPayments.map((fp, ind) => {
              if (fp.brand === bp.brand) {
                finalPayments[ind].amount += bp.amount;
              }
              if (fp.brand !== bp.brand) {
                bp.day = date[2];
                bp.month = date[1];
                bp.year = date[0];
                bp.shopId = '5a83107bf56f6b2aab5b97ae';
                // bp.remaining = 0;
                finalPayments.push(bp);
              }
            });
          });
          let brands = finalPayments.map(fp => { return fp.brand; });
          let shopProducts;
          console.log(finalPayments, brands);
          models.Product.find({where: {brand: {inq: brands}}},
            (err, res) => {
              if (res.length > 0) {
                shopProducts = res.map(product => {
                  if (product.shopId === '5a83107bf56f6b2aab5b97ae') {
                    return product;
                  }
                });
                shopProducts.map((product, index) => {
                  finalPayments.map((payment, ind) => {
                    if (product.brand === payment.brand) {
                      console.log(product.brand, product.quantity, product.basePrice);
                      finalPayments[ind].remaining += parseInt(product.quantity) * parseInt(product.basePrice);
                    }
                  });
                });
                console.log(finalPayments);
                models.BrandDues.create(finalPayments, (err, res) => {
                  next();
                });
              }
            });
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
    models.Bill.find({where: {shopId: '5a83107bf56f6b2aab5b97af', day: date[2],
      month: date[1], year: date[0]}},
      (err, bill) => {
        if (bill.length > 0) {
          bills.push(bill);
        }
        if (count === 6) {
          bills = _.flatMap(bills);
          let count = 1;
          billProducts = _.map(bills, bill => bill._products);
          billProducts = _.flatMap(billProducts);
          billProducts.map(product => {
            brandpayments.push({
              shopId: '5a83107bf56f6b2aab5b97af',
              brand: product.brand,
              amount: parseInt(product.quantity) * parseInt(product.basePrice),
              remaining: 0,
            });
          });
          brandpayments.map((bp, index) => {
            let date = d.toLocaleDateString().split('-');
            if (finalPayments.length < 1) {
              bp.day = date[2];
              bp.month = date[1];
              bp.year = date[0];
              bp.shopId = '5a83107bf56f6b2aab5b97af';
              // bp.remaining = 0;
              finalPayments.push(bp);
            }
            finalPayments.map((fp, ind) => {
              if (fp.brand === bp.brand) {
                finalPayments[ind].amount += bp.amount;
              }
              if (fp.brand !== bp.brand) {
                bp.day = date[2];
                bp.month = date[1];
                bp.year = date[0];
                bp.shopId = '5a83107bf56f6b2aab5b97af';
                // bp.remaining = 0;
                finalPayments.push(bp);
              }
            });
          });
          let brands = finalPayments.map(fp => { return fp.brand; });
          let shopProducts;
          models.Product.find({where: {brand: {inq: brands}}},
            (err, res) => {
              if (res.length > 0) {
                shopProducts = res.map(product => {
                  if (product.shopId === '5a83107bf56f6b2aab5b97af') {
                    return product;
                  }
                });
                shopProducts.map((product, index) => {
                  finalPayments.map((payment, ind) => {
                    if (product.brand === payment.brand) {
                      finalPayments[ind].remaining += parseInt(product.quantity) * parseInt(product.basePrice);
                    }
                  });
                });
                console.log(finalPayments);
                models.BrandDues.create(finalPayments, (err, res) => {
                  next();
                });
              }
            });
        }
      });
  });
}

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
