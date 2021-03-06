'use strict';

module.exports = function(Bill) {
  Bill.beforeRemote('prototype.patchAttributes', (ctx, instance, next) => {
    ctx.args.data._products = ctx.args.data.newProducts;
    let count = 0;
    ctx.instance._products.map((product, index) => {
      Bill.app.models.Product.findById(product.productId,
      (err, productRes) => {
        if (err || productRes === null) {
          return next(err, null);
        }
        ctx.instance._products[index].brand = productRes.brand;
        let quantity = parseInt(productRes.quantity) + parseInt(product.quantity);
        Bill.app.models.Product.updateAll({id: product.productId}, {quantity: quantity},
          (err, res) => {
            count ++;
            if (count === ctx.instance._products.length) {
              count = 0;
              ctx.args.data.newProducts.map(product => {
                Bill.app.models.Product.findById(product.productId, (err, productRes) => {
                  if (err) {
                    return next(err, null);
                  }
                  let quantity = parseInt(productRes.quantity) - parseInt(product.quantity);
                  Bill.app.models.Product.updateAll({id: product.productId}, {quantity: quantity},
                  (err, res) => {
                    count++;
                    if (count === ctx.args.data.newProducts.length) {
                      next();
                    }
                  });
                });
              });
            }
          });
      });
    });
  });
  Bill.remoteMethod('bills', {
    accepts: [{arg: 'shopId', type: 'string'},
      {arg: 'day', type: 'string'},
      {arg: 'month', type: 'string'},
      {arg: 'year', type: 'string'}],
    returns: {arg: 'bills', type: 'object'},
    http: {path: '/bills', verb: 'get'},
  });

  Bill.bills = (shopId, day, month, year, next) => {
    Bill.find({where: {shopId: shopId, day: day, month: month, year: year}}, (err, bills) => {
      if (bills) {
        next(null, bills);
      } else {
        next(null, []);
      }
    });
  };

  Bill.beforeRemote('create', (ctx, instance, next) => {
    let count = 0;
    ctx.args.data._products.forEach((value, index) => {
      Bill.app.models.Product.findById(value.productId,
          (err, product) => {
            ctx.args.data._products[index].salePrice = product.salePrice;
            ctx.args.data._products[index].basePrice = product.basePrice;
            ctx.args.data._products[index].brandId = product.brandId;
            ctx.args.data._products[index].brand = product.brand;
            // ctx.args.data._products[index].productPayment = `${product.brand}@${parseInt(product.basePrice) * parseInt(product.quantity)}`;
            // console.log(ctx.args.data._products[index]);
            let quantity = parseInt(product.quantity) - parseInt(value.quantity);
            if (quantity < 0) {
              next({statusCode: 422, message: 'Enough Product Quantity not available'}, null);
            } else {
              Bill.app.models.Product.updateAll({id: value.productId, shopId: ctx.args.shopId},
                {quantity: quantity}, (err, productUpdate) => {
                  count = count + 1;
                  if (count == ctx.args.data._products.length) {
                    next(null, ctx);
                  }
                });
            }
          });
    });
  });

  Bill.findBills = (shopId, day, month, year) => {
    Bill.find({where: {shopId: shopId, day: day, month: month, year: year}},
      (err, res) => {
        if (err) {
          return err;
        }
        return res;
      });
  };
};
