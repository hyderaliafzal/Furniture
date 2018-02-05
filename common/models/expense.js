'use strict';

module.exports = function(Expense) {
Expense.validatesUniquenessOf('date', {message: 'Record exists.'});
};
