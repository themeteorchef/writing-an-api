Router.route( '/api/v1/pizza', function() {
  // Two parts here. Oof. So, our friend CORS is fussy. In order to get our
  // request through, we need to do two things: let it know that the request
  // is allowed from the originating server AND, let it know what options it
  // is allowed to send with the request.

  // There are two types of requests happening: OPTIONS and the actual request.
  // An OPTIONS request is known as a "pre-flight" request. Before the actual
  // request is run, it will ask if it is allowed to make the request, AND,
  // if the data it's asking to pass over is allowed.

  // Setting Access-Control-Allow-Origin answers the first question, by saying
  // what domains requests are allowed to be made from (in this case * is equal
  // to saying "anywhere").
  this.response.setHeader( 'Access-Control-Allow-Origin', '*' );

  // Here, we check the request method to see if it's an OPTIONS request, or,
  // a pre-flight check. If it is, we pass along a list of allowed headers and
  // methods, followed by an end to that request (the pre-flight). Once this is
  // received by the requesting server, it will attempt to perform the actual
  // request (GET, POST, PUT, or DELETE).
  if ( this.request.method === "OPTIONS" ) {
    this.response.setHeader( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept' );
    this.response.setHeader( 'Access-Control-Allow-Methods', 'POST, PUT, GET, DELETE, OPTIONS' );
    this.response.end( 'Set OPTIONS.' );
  } else {
    // If we've already passed through the OPTIONS request, we go ahead and call
    // our actual HTTP method.
    API.handleRequest( this, 'pizza', this.request.method );
  }

}, { where: 'server' } );
