API.resources.pizza.get( function() {
  var connection = API.connection( this.request );

  if ( !connection.error ) {
    API.methods.pizza.get( this, connection );
  } else {
    API.utility.response( this, 401, connection );
  }
});

API.resources.pizza.post( function() {
  var connection = API.connection( this.request );

  if ( !connection.error ) {
    API.methods.pizza.post( this, connection );
  } else {
    API.utility.response( this, 401, connection );
  }
});

API.resources.pizza.put( function() {
  var connection = API.connection( this.request );

  if ( !connection.error ) {
    API.methods.pizza.put( this, connection );
  } else {
    API.utility.response( this, 401, connection );
  }
});

API.resources.pizza.delete( function() {
  var connection = API.connection( this.request );

  if ( !connection.error ) {
    API.methods.pizza.delete( this, connection );
  } else {
    API.utility.response( this, 401, connection );
  }
});
