'use strict';

module.exports = function(Shop) {
    Shop.remoteMethod('getMonthlyReport', {
        accepts: [{arg: 'shopId', type: 'string', required: true},
        {arg: 'month', type: 'number', required: true}],
        returns: {arg: 'report', type: {},
        http: {path: '/getMonthlyReport', verb: 'get'}}
  });

  Shop.getMonthlyReport = ((shopId, month, next)=> {
      Shop.findById(shopId, (err, shop) => {
          if(err || shop === null){
              next(err);
          } else {
              Shop.app.models.Expense.find({where: {month: month, shopId: shopId}}, 
            (err, res) => {
                next(null, res);
            });
          }
      });
  });
  
};
