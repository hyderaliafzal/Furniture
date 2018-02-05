'use strict';

module.exports = function(Bill) {
  Bill.beforeRemote('create', (ctx, instance, next) => {
    let count = 0;
    ctx.args.data._products.forEach((value, index) => {
      Bill.app.models.Product.findById(value.productId,
          (err, product) => {
            ctx.args.data._products[index].salePrice = product.salePrice;
            ctx.args.data._products[index].basePrice = product.basePrice;
            // console.log(ctx.args.data._products[index]);
            let quantity = parseInt(product.quantity) - parseInt(value.quantity);
            if (quantity < 0) {
              next({statusCode: 422, message: 'Enough Product Quantity not available'}, null);
            } else {
              Bill.app.models.Product.updateAll({id: value.productId, shopId: ctx.args.shopId},
                {quantity: quantity}, (err, productUpdate) => {
                  count = count + 1;
                  console.log(count);
                  if (count == ctx.args.data._products.length) {
                    next(null, ctx);
                  }
                });
            }
          });
    });
  });
};
