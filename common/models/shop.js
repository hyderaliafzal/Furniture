'use strict';

module.exports = function(Shop) {
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
          {where: {shopId: shopId, status: 'Paid', month: month, year: year}},
            (err, bills) => {
              if (bills) {
                let basePrices, salePrices;
                bills.map(bill=>{
                  bill.products.map(p => {
                    Shop.app.models.Product.findById(p.productId,
                      (err, product) => {
                        console.log(product);
                        if (product) {
                          basePrices += (product.basePrice * p.quantity);
                          salePrices += (product.salePrice * p.quantity);
                        }
                      });
                  });
                });
                let response = {
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
          {where: {day: day, month: month, year: year, shopId: shopId}},
          (err, expense) => {
            Shop.app.models.Bill.find(
              {where: {shopId: shopId, status: 'Paid',
                day: day, month: month, year: year}},
              (err, bills) => {
                console.log(bills);
                if (bills) {
                  let basePrices, salePrices;
                  bills.map(bill=>{
                    bill.products.map(p => {
                      Shop.app.models.Product.findById(p.productId,
                        (err, product) => {
                          if (product) {
                            basePrices += (product.basePrice * p.quantity);
                            salePrices += (product.salePrice * p.quantity);
                          }
                        });
                    });
                  });
                  let response = {
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
