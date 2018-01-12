'use strict';

module.exports = function(Product) {
    Product.beforeRemote('create', (ctx, _instance_, next) => {
        Product.app.models.Category.find({where: {name: ctx.args.data.category}}, (err, category) => {
            if(category.length > 0) {
                ctx.args.data.categoryId = category[0].id;
                next();
            } else {
                Product.app.models.Category.create({name: ctx.args.data.category}, (err, res) => {
                    ctx.args.data.categoryId = res.id;
                    next();
                });
            }
        });     
    });
};
