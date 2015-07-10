API = {
  authentication: function( apiKey ) {
    var getUser = APIKeys.findOne( { "key": apiKey }, { fields: { "owner": 1 } } );
    if ( getUser ) {
      return getUser.owner;
    } else {
      return false;
    }
  },
  connection: function( request ) {
    var apiKey    = request.headers[ 'x-api-key' ],
        validUser = API.authentication( apiKey );

    if ( validUser ) {
      var getRequestContents = API.utility.getRequestContents( request ),
          requestData        = { "owner": validUser, data: getRequestContents };
      return requestData;
    } else {
      return { error: 401, message: "Invalid API key." };
    }
  },
  handleRequest: function( context, resource, method ) {
    var connection = API.connection( context.request );
    if ( !connection.error ) {
      API.methods[ resource ][ method ]( context, connection );
    } else {
      API.utility.response( context, 401, connection );
    }
  },
  methods: {
    pizza: {
      get: function( context, connection ) {
        // Check to see if our request has any data. If it doesn't, we want to
        // return all pizzas for the owner. If it does, we want to search for
        // pizzas matching that query.
        var hasQuery = API.utility.hasData( connection.data );

        if ( hasQuery ) {
          connection.data.owner = connection.owner;
          var getPizzas = Pizza.find( connection.data ).fetch();

          if ( getPizzas.length > 0 ) {
            // We found some pizzas, we can pass a 200 (success) and return the
            // found pizzas.
            API.utility.response( context, 200, getPizzas );
          } else {
            // Bummer, we didn't find any pizzas. We can pass a 404 (not found)
            // and return an error message.
            API.utility.response( context, 404, { error: 404, message: "No pizzas found, dude." } );
          }
        } else {
          // Our request didn't contain any params, so we'll just return all of
          // the pizzas we have for the owner associated with the passed API key.
          var getPizzas = Pizza.find( { "owner": connection.owner } ).fetch();
          API.utility.response( context, 200, getPizzas );
        }
      },
      post: function( context, connection ) {
        // Make sure that our request has data and that the data is valid.
        var hasData   = API.utility.hasData( connection.data ),
            validData = API.utility.validate( connection.data, { "name": String, "crust": String, "toppings": [ String ] });

        if ( hasData && validData ) {
          connection.data.owner = connection.owner;
          var pizza = Pizza.insert( connection.data );
          API.utility.response( context, 200, { "_id": pizza, "message": "Pizza successfully created!" } );
        } else {
          API.utility.response( context, 403, { error: 403, message: "POST calls must have a name, crust, and toppings passed in the request body in the correct formats." } );
        }
      },
      put: function( context, connection ) {
        var hasQuery  = API.utility.hasData( connection.data ),
            validData = API.utility.validate( connection.data, Match.OneOf(
              { "_id": String, "name": String },
              { "_id": String, "crust": String },
              { "_id": String, "toppings": [ String ] },
              { "_id": String, "name": String, "crust": String },
              { "_id": String, "name": String, "toppings": [ String ] },
              { "_id": String, "crust": String, "toppings": [ String ] },
              { "_id": String, "name": String, "crust": String, "toppings": [ String ] }
            ));

        if ( hasQuery && validData ) {
          // Save the ID of the pizza we want to update and then sanatize our
          // data so that it only includes name, crust, and toppings parameters.
          var pizzaId = connection.data._id;
          delete connection.data._id;

          var getPizza = Pizza.findOne( { "_id": pizzaId }, { fields: { "_id": 1 } } );

          if ( getPizza ) {
            Pizza.update( { "_id": pizzaId }, { $set: connection.data } );
            API.utility.response( context, 200, { "message": "Pizza successfully updated!" } );
          } else {
            API.utility.response( context, 404, { "message": "Can't update a non-existent pizza, homeslice." } );
          }
        } else {
          API.utility.response( context, 403, { error: 403, message: "PUT calls must have a pizza ID and at least a name, crust, or toppings passed in the request body in the correct formats (String, String, Array)." } );
        }
      },
      delete: function( context, connection ) {
        var hasQuery  = API.utility.hasData( connection.data ),
            validData = API.utility.validate( connection.data, { "_id": String } );

        if ( hasQuery && validData ) {
          var pizzaId  = connection.data._id;
          var getPizza = Pizza.findOne( { "_id": pizzaId }, { fields: { "_id": 1 } } );

          if ( getPizza ) {
            Pizza.remove( { "_id": pizzaId } );
            API.utility.response( context, 200, { "message": "Pizza removed!" } );
          } else {
            API.utility.response( context, 404, { "message": "Can't delete a non-existent pizza, homeslice." } );
          }
        } else {
          API.utility.response( context, 403, { error: 403, message: "DELETE calls must have an _id (and only an _id) in the request body in the correct format (String)." } );
        }
      }
    }
  },
  resources: {
    pizza: Router.route( '/api/v1/pizza', { where: 'server' } )
  },
  utility: {
    getRequestContents: function( request ) {
      switch( request.method ) {
        case "GET":
          return request.query;
        case "POST":
        case "PUT":
        case "DELETE":
          return request.body;
      }
    },
    hasData: function( data ) {
      return Object.keys( data ).length > 0 ? true : false;
    },
    response: function( context, statusCode, data ) {
      context.response.setHeader( 'Content-Type', 'application/json' );
      context.response.setHeader( 'Access-Control-Allow-Origin', '*' );
      context.response.statusCode = statusCode;
      context.response.end( JSON.stringify( data ) );
    },
    validate: function( data, pattern ) {
      return Match.test( data, pattern );
    }
  }
};
