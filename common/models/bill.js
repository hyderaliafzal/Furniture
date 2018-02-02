'use strict';

module.exports = function(Bill) {
  Bill.beforeRemote('create', (ctx, instance, next) => {
    ctx.args.data.products.map(value => {
      Bill.app.models.Product.find(
      {where: {id: value.productId, shopId: ctx.args.shopId}},
      (err, product) => {
        console.log(product);
        let quantity = parseInt(product[0].quantity) - parseInt(value.quantity);
        if (quantity < 0) {
          next({statusCode: 422, message: 'Enough Product Quantity not available'}, null);
        }
        Bill.app.models.Product.update({where: {id: value.productId, shopId: ctx.args.shopId}},
                {quantity: quantity}, (err, productUpdate) => {
                });
      });
    });
    next();
  });
};
