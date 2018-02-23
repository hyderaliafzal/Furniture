'use strict';

module.exports = function(Shop) {
  Shop.remoteMethod('shop', {accepts: [
    {arg: 'request', type: 'object', http: {source: 'req'}},
  ],
    returns: {arg: 'shop', type: 'Shop', root: true},
    http: {path: '/shop', verb: 'get'},
  });
  Shop.shop = (ctx, next) => {
    let userId = ctx.accessToken.userId;
    Shop.app.models.RoleMapping.findOne({where: {principalId: userId},
      include: {relation: 'role'},
      scope: {include: ['Role']}},
  (err, role) => {
    if (role) {
      if (role.toJSON().role.name === 'superAdmin') {
        Shop.find((err, shop) => {
          next(null, shop);
        });
      } else {
        Shop.app.models.Account.findById(userId, (err, account) => {
          Shop.findById(account.shopId, (err, shop) => {
            if (shop) {
              return next(null, [shop]);
            } else {
              return next(null, []);
            }
          });
        });
      }
    } else {
      return next('No Role Found', null);
    }
  });
  };
  Shop.remoteMethod('getMonthlyReport', {
    accepts: [{arg: 'shopId', type: 'string'},
      {arg: 'month', type: 'string'},
      {arg: 'year', type: 'string'}],
    returns: {arg: 'Report', type: 'object'},
    http: {path: '/getMonthlyReport', verb: 'get'},
  });

  Shop.getMonthlyReport = (shopId, month, year,  next) => {
    Shop.findById(shopId, (err, shop) => {
      if (err || shop === null) {
        next(err);
      } else {
        Shop.app.models.Expense.find(
          {where: {month: month, year: year, shopId: shopId}},
          (err, expense) => {
            Shop.app.models.Bill.find(
              {where: {shopId: shopId, status: 'Paid',
                month: month, year: year}},
              (err, bills) => {
                if (bills.length > 0) {
                  let basePrices = 0; let salePrices = 0; let payment = 0;
                  let discount = 0;
                  return new Promise(resolve => {
                    let count = 0;
                    bills.map(bill => {
                      payment += parseInt(bill.payment);
                      discount += parseInt(bill.discount);
                      bill._products.forEach(p => {
                        basePrices += (p.basePrice * p.quantity);
                        salePrices += (p.salePrice * p.quantity);
                      });
                      count++;
                      if (count === bills.length) {
                        return resolve();
                      }
                    });
                  }).then(() => {
                    expenseTotalMonthly(month, year, shopId).then(result => {
                      let exp = 0;
                      if (expense.length > 0) {
                        exp = parseInt(expense[0].salaries) + parseInt(expense[0].committee) + parseInt(expense[0].extra) + parseInt(expense[0].housholds);
                      }
                      next(null, {
                        payment: payment,
                        discount: discount,
                        basePrices: basePrices,
                        salePrices: salePrices,
                        expense: exp,
                        dailyExp: result});
                    });
                  }
                );
                }
              });
          });
      }
    });
  };

  function expenseTotalMonthly(month, year, shopId) {
    return new Promise(resolve => {
      Shop.app.models.DailyExpense.find({where: {
        shopId: shopId, month: month, year: year,
      }}, (err, expense) => {
        console.log(expense);
        if (expense.length > 0) {
          let amount = 0;
          let count = 0;
          expense.map(exp => {
            amount += parseInt(exp.drinks) + parseInt(exp.shopExp) + parseInt(exp.others);
            count++;
            if (count === expense.length) {
              return resolve(amount);
            }
          });
        } else {
          return resolve(0);
        }
      });
    });
  }

  Shop.remoteMethod('getDailyReport', {
    accepts: [{arg: 'shopId', type: 'string'},
      {arg: 'day', type: 'string'},
      {arg: 'month', type: 'string'},
      {arg: 'year', type: 'string'}],
    returns: {arg: 'Report', type: 'object'},
    http: {path: '/getDailyReport', verb: 'get'},
  });

  Shop.getDailyReport = (shopId, day, month, year,  next) => {
    Shop.findById(shopId, (err, shop) => {
      if (err || shop === null) {
        next(err);
      } else {
        expenseTotalDaily(day, month, year, shopId).then(amount => {
          Shop.app.models.Bill.find({where: {shopId: shopId, status: 'Paid',
            day: day, month: month, year: year}},
            (err, bills) => {
              if (bills.length > 0) {
                let count = 0;
                let basePrices = 0; let salePrices = 0; let payment = 0;
                let discount = 0;
                console.log(bills);
                return new Promise(resolve => {
                  bills.map(bill => {
                    payment += parseInt(bill.payment);
                    discount += parseInt(bill.discount);
                    bill._products.forEach(p => {
                      basePrices += (parseInt(p.basePrice) * parseInt(p.quantity));
                      salePrices += (parseInt(p.salePrice) * parseInt(p.quantity));
                    });
                    count ++;
                    if (count === bills.length) {
                      return resolve();
                    }
                  });
                }).then(() => {
                  let response = {
                    payment: payment,
                    basePrices: basePrices,
                    salePrices: salePrices,
                    discount: discount,
                    expense: amount,
                  };
                  next(null, response);
                });
              } else {
                let response = {
                  payment: 0,
                  basePrices: 0,
                  salePrices: 0,
                  discount: 0,
                  expense: amount,
                };
                next(null, response);
              }
            }
          );
        });
      }
    });
  };

  function expenseTotalDaily(day, month, year, shopId) {
    return new Promise(resolve => {
      Shop.app.models.DailyExpense.find({where: {day: day, month: month,
        year: year, shopId: shopId}}, (err, res) => {
        if (res.length > 0) {
          console.log(res);
          return resolve(parseInt(res[0].drinks) + parseInt(res[0].shopExp) + parseInt(res[0].others));
        } else {
          return resolve(0);
        }
      });
    });
  }

  Shop.remoteMethod('getYearReport', {
    accepts: [{arg: 'shopId', type: 'string'},
      {arg: 'year', type: 'string'}],
    returns: {arg: 'Report', type: 'object'},
    http: {path: '/getYearReport', verb: 'get'},
  });

  Shop.getYearReport = (shopId, year) => {
    for (let i = 1; i < 13; i++) {

    }
  };
};
