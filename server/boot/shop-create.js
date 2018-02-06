'use strict';
module.exports = function(app) {
  console.log("here");
  app.models.Shop.find((err, res) => {
    console.log("shop",res);
    if (res.length < 2) {
      const shops = [{name: 'Citizen',
        address: 'Shahdra, Lahore'},
      {name: 'Woodworks',
        address: 'Gulberg III, Lahore'}];

      shops.forEach(shop => {
        app.models.Shop.create(shop, (err, res) => {
          console.log(res);
        });
      });
    }
  });
};
