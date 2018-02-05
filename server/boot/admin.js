'use strict';
module.exports = function(app) {
  const Role = app.models.Role;
  const Account = app.models.Account;
  const RoleMapping = app.models.RoleMapping;
  Role.find({where: {name: 'superAdmin'}}, (err, role)=> {
    if (!role || role.length === 0) {
      Role.create({name: 'superAdmin'}, (err, role)=> {
        if (err) {
          console.error(err);
        }
        if (role) {
          Account.find({where: {username: 'superadmin'}}, (err, user)=> {
            if (!user || user.length === 0) {
              Account.create([{username: 'superadmin',
                email: 'superadmin@email.com',
                firstName: 'super', lastName: 'admin', group: 'admin',
                password: 'superadmin', emailVerified: true},
              ], (err, user)=> {
                RoleMapping.create({
                  principalType: RoleMapping.USER,
                  principalId: user[0].id,
                  roleId: role.id,
                }, (err, roleMapping)=> {
            // console.log('here', roleMapping);
                });
              });
            }
          });
        }
      });
    }
  });
	Role.find({where: {name: 'Manager'}}, (err, role)=> {
    if (!role || role.length === 0) {
      Role.create({name: 'Manager'}, (err, role)=> {
        if (err) {
          console.error(err);
        }
      });
    }
  });
	Role.find({where: {name: 'Sales'}}, (err, role)=> {
    if (!role || role.length === 0) {
      Role.create({name: 'Sales'}, (err, role)=> {
        if (err) {
          console.error(err);
        }
      });
    }
  });
};
