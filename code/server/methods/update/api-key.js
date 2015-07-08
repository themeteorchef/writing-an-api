/*
* Methods: Update - API Key
* Updates the users API key.
*/

Meteor.methods({
  regenerateApiKey: function( userId ){
    check( userId, String );

    var getUsersKey = APIKeys.findOne( { "owner": userId }, { fields: { "key": 1 } } ),
        newKey      = Random.hexString( 32 );

    // Perform the update.
    try {
      var keyId = APIKeys.update( getUsersKey._id, {
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
