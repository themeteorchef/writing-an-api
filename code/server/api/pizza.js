API.resources.pizza.get( function() {
  API.handleRequest( this, 'pizza', 'get' );
});

API.resources.pizza.post( function() {
  API.handleRequest( this, 'pizza', 'post' );
});

API.resources.pizza.put( function() {
  API.handleRequest( this, 'pizza', 'put' );
});

API.resources.pizza.delete( function() {
  API.handleRequest( this, 'pizza', 'delete' );
});
