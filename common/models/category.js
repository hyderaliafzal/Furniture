'use strict';

module.exports = function(Category) {
    Category.beforeRemote('create', (ctx, instance, next) => {
        Category.validatesUniquenessOf('name', {message: 'Category Exists'});
        next();
    });

    Category.remoteMethod('categories', {
        accepts: [{arg: 'shopId', type: 'string'}],
        returns: {arg: 'categories', type: 'object'},
        http: {path: '/categories', verb: 'get'},
      });
    
     Category.categories = (shopId, next) => {
        let categories = [];
        Category.find((err, category) => {
          if(category.length > 0){
            let count = 1;
            category.map(cat => {
              if(cat.shopId === shopId){
                categories.push(cat);
              }
              if(count === category.length){
                next(null, categories);
              }
              count++;
            });
          } else {
            next(null, []);
          }
        });
      }
};
