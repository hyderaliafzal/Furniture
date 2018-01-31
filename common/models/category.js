'use strict';

module.exports = function(Category) {
    Category.beforeRemote('create', (ctx, instance, next) => {
        Category.validatesUniquenessOf('name', {message: 'Category Exists'});
        next();
    });
};
