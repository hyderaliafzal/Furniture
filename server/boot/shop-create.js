'use strict';
module.exports = function(app) {
  app.models.Shop.find((err, res) => {
    console.log(res);
    if (res.length < 2) {
      const shops = [{name: '"Citizen Plastic & Steel Furnitire',
        address: 'Main G.T Road, Ravi Toll Plaza, Lahore'},
      {name: '"Citizen Plastic & Steel Furnitire',
        address: 'Main College Road Near Al-Janat Marriage Hall, Khokhar Chowk, Township, Lahore}];

      shops.forEach(shop => {
        app.models.Shop.create(shop, (err, res) => {
          console.log(res);
        });
      });
    }
  });
};
