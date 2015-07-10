Template.apiKey.onCreated(function(){
  // Here, we're making use of Meteor's new template-level subscriptions.
  this.subscribe( "APIKey" );
});

Template.apiKey.helpers({
  apiKey: function() {
    // Note: because we know our publication is already returning the key for
    // the current user, and we only expect it to return 1 key, we can do
    // a findOne here without any projections. Nice!
    var apiKey = APIKeys.findOne();

    if ( apiKey ) {
      return apiKey.key;
    }
  }
});

Template.apiKey.events({
  'click .regenerate-api-key': function(){
     var userId              = Meteor.userId(),
         confirmRegeneration = confirm( "Are you sure? This will invalidate your current key!" );

     if ( confirmRegeneration ) {
       Meteor.call( "regenerateApiKey", userId, function( error, response ) {
         if ( error ) {
           Bert.alert( error.reason, "danger" );
         } else {
           Bert.alert( "All done! You have a new API key.", "success" );
         }
       });
     }
  }
});
