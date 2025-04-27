module.exports = {
   up: function(queryInterface, Sequelize) {
     // logic for transforming into the new state
     return queryInterface.addColumn(
       'Users',
       'refresh_token',
      Sequelize.STRING
     );
 
   },
 
   down: function(queryInterface, Sequelize) {
     // logic for reverting the changes
     return queryInterface.removeColumn(
       'Users',
       'refresh_token'
     );
   }
 }