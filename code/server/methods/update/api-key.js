/*
* Methods: Update - API Key
* Updates the users API key.
*/

Meteor.methods({
  regenerateApiKey: function( userId ){
    check( userId, Meteor.userId() );

    var newKey = Random.hexString( 32 );

    // Perform the update.
    try {
      var keyId = APIKeys.update( { "owner": userId }, {
        $set: {
          "key": newKey
        }
      });
      return keyId;
    } catch(exception) {
      // If an error occurs, return it to the client.
      return exception;
    }
  }
});
