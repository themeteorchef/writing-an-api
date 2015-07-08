API.resources.pizza.get( function() {

  var connection = API.connection( this.request );

  if ( !connection.error ) {
    console.log( connection );
  } else {
    API.utility.response( this, 401, connection );
  }
});

API.resources.pizza.post( function() {
  var connection = API.connection( this.request );

  if ( !connection.error ) {
    console.log( connection );
  } else {
    API.utility.response( this, 401, connection );
  }
});

API.resources.pizza.put( function() {
  var connection = API.connection( this.request );

  if ( !connection.error ) {
    console.log( connection );
  } else {
    API.utility.response( this, 401, connection );
  }
});

API.resources.pizza.delete( function() {
  var connection = API.connection( this.request );

  if ( !connection.error ) {
    console.log( connection );
  } else {
    API.utility.response( this, 401, connection );
  }
});
