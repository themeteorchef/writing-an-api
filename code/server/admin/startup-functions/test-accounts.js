/*
* Generate Test Accounts
* Creates a collection of test accounts automatically on startup.
*/

generateTestAccounts = function(){
  // Create an array of user accounts.
  var users = [
    { name: "Admin", email: "admin@admin.com", password: "password" }
  ];

  // Loop through array of user accounts.
  for(i=0; i < users.length; i++){
    // Check if the user already exists in the DB.
    var userEmail = users[i].email,
        checkUser = Meteor.users.findOne({"emails.address": userEmail});

    // If an existing user is not found, create the account.
    if ( !checkUser ) {
      var user = Accounts.createUser({
        email: userEmail,
        password: users[i].password,
        profile: {
          name: users[i].name
        }
      });

      Meteor.call( "initApiKey", user );

      // Load our default user up with some pizzas so we have some data
      // to work with out of the box.
      for( var i = 0; i < PIZZAS.length; i++ ) {
        PIZZAS[ i ].owner = user;
        Pizza.insert( PIZZAS[ i ] );
      }
    }
  }
};
