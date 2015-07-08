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
    response: function( context, statusCode, data ) {
      context.response.setHeader("Content-Type", "application/json");
      context.response.setHeader("Access-Control-Allow-Origin", "*");
      context.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      context.response.statusCode = statusCode;
      context.response.end( JSON.stringify( data ) );
    }
  }
};
