'use strict';
module.exports = function(app) {
  app.models.Shop.find((err, res) => {
    // console.log(res);
    if (res.length < 2) {
      const shops = [{name: 'Citizen Plastic & Steel Furniture',
        address: 'Main G.T Road, Ravi Toll Plaza, Lahore',
        'contact': '042-37901221',
        'mobile': 'Akhter: 0324-44417414, M. Nabeel Ch. :0323-9999333',
        'email': 'nabeelsameer950@gmail.com'},
      {name: 'Citizen Plastic & Steel Furniture',
        address: 'Main College Road Near Al-Janat Marriage Hall, Khokhar Chowk, Township, Lahore',
        'contact': '042-35132695',
        'mobile': 'Shop: 0308-9094992, M. Nabeel Ch. :0323-9999333',
        'email': 'nabeelsameer950@gmail.com'}];

      shops.forEach(shop => {
        app.models.Shop.create(shop, (err, res) => {
          console.log(res);
        });
      });
    }
  });
};
