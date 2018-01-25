'use strict';

module.exports = function(Account) {
  delete Account.validations.email;
  Account.observe('after save', (ctx, next) => {
    if (ctx.isNewInstance === true) {
      Account.app.models.Role.find({where: {name: ctx.instance.role}}, (err, role) => {
        if (err) {
          next(err, null);
        }
        let rolemap = {
          principalType: 'USER',
          principalId: ctx.instance.id,
          roleId: role[0].id,
        };
        Account.app.models.RoleMapping.create(rolemap, (err, res) => {
          if (err) {
            next(err, null);
          }
          next();
        });
      });
    } else {
      next();
    }
  });

};
