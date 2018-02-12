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

  Account.remoteMethod('role', {    accepts: [
      {arg: 'request', type: 'object', http: {source: 'req'}},
    ],
    returns: {arg: 'role', type: 'string', root: true},
    http: {path: '/role', verb: 'get'},
  });

  Account.role = (ctx, next) => {
    console.log(ctx);
    Account.app.models.RoleMapping.findOne({where: {principalId: ctx.accessToken.userId},
      include: {relation: 'role'},
      scope: {include: ['Role']}}, (err, res) => {
      next(null, res);
  });
  }
};
