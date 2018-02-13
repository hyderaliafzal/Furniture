'use strict';

module.exports = function(Shop) {
  Shop.remoteMethod('shop', {    accepts: [
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
    if(role){
      console.log(role.toJSON().role);
      if(role.toJSON().role.name === 'superAdmin'){
        console.log(shop);
        Shop.find((err, shop) => {
          next(null, shop);
        });
      } else {
        Shop.app.models.Account.findById(userId, (err, account) => {
          Shop.findById(account.shopId, (err, shop) => {
            if(shop){
              console.log(shop);
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
  }
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
                if (bills) {
                  let basePrices = 0; let salePrices = 0; let payment = 0;
                  bills.map(bill=>{
                    payment += parseInt(bill.payment);
                    bill._products.forEach(p => {
                      basePrices += (p.basePrice * p.quantity);
                      salePrices += (p.salePrice * p.quantity);
                    });
                  });
                  let response = {
                    payment: payment,
                    basePrices: basePrices,
                    salePrices: salePrices,
                    expense: expense};
                  next(null, response);
                }
              }
            );
          });
      }
    });
  };

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
        Shop.app.models.Expense.find(
          {where: {month: month, year: year, shopId: shopId}},
          (err, expense) => {
            Shop.app.models.Bill.find(
              {where: {shopId: shopId, status: 'Paid',
                day: day, month: month, year: year}},
              (err, bills) => {
                if (bills) {
                  let basePrices = 0; let salePrices = 0; let payment = 0;
                  bills.map(bill=>{
                    payment += parseInt(bill.payment);
                    bill._products.forEach(p => {
                      basePrices += (p.basePrice * p.quantity);
                      salePrices += (p.salePrice * p.quantity);
                    });
                  });
                  let response = {
                    payment: payment,
                    basePrices: basePrices,
                    salePrices: salePrices,
                    expense: expense};
                  next(null, response);
                }
              }
            );
          });
      }
    });
  };
};
