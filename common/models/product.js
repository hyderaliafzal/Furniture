'use strict';

module.exports = function(Product) {
  Product.remoteMethod('products', {
    accepts: [{arg: 'shopId', type: 'string'}],
    returns: {arg: 'products', type: 'object'},
    http: {path: '/products', verb: 'get'},
  });

 Product.products = (shopId, next) => {
    let products = [];
    Product.find({shopId: shopId}, (err, product) => {
      if(product.length > 0){
        let count = 1;
        product.map(pr => {
          if(pr.shopId === shopId){
            products.push(pr);
          }
          if(count === product.length){
            next(null, products);
          }
        });
      } else {
        next(null, []);
      }
    });
  }

  Product.beforeRemote('create', (ctx, _instance_, next) => {
    Product.app.models.Category.find({where: {name: ctx.args.data.category}},
      (err, category) => {
        if (category.length > 0) {
          ctx.args.data.categoryId = category[0].id;
          Product.app.models.Brand.find({where: {name: ctx.args.data.brand,
            shopId: ctx.args.data.shopId}},
            (err, brand) => {
              console.log(brand);
              if (brand.length > 0) {
                ctx.args.data.brandId = brand[0].id;
                next();
              } else {
                Product.app.models.Brand.create({name: ctx.args.data.brand},
                  (err, brand) => {
                    ctx.args.data.brandId = brand.id;
                    next();
                  });
              }
            });
        } else {
          Product.app.models.Category.create({
            name: ctx.args.data.category,
            shopId: ctx.args.data.shopId}, (err, res) => {
            ctx.args.data.categoryId = res.id;
            Product.app.models.Brand.find({where: {name: ctx.args.data.brand}},
              (err, brand) => {
                if (brand.length > 0) {
                  ctx.args.data.brandId = brand[0].id;
                  next();
                } else {
                  Product.app.models.Brand.create({name: ctx.args.data.brand,
                    shopId: ctx.args.data.shopId},
                    (err, brand) => {
                      ctx.args.data.brandId = brand.id;
                      next();
                    });
                }
              });
          });
        }
      });
  });
};
