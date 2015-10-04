/*
* Methods: Insert - API Key
* Creates the users API key.
*/

Meteor.methods({
  initApiKey: function( userId ) {
    check( userId, Match.OneOf( Meteor.userId(), String ) );

    var newKey = Random.hexString( 32 );

    try {
       var key = APIKeys.insert({
        "owner": userId,
        "key": newKey
       });
       return key;
    } catch( exception ) {
      return exception;
    }
  }
});
