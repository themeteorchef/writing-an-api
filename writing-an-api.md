### Getting Started
For this recipe, we're going to need to make sure we have access to the following packages. These will help us with creating our actual API but also securing data and authenticating requests _to_ that API.

<p class="block-header">Terminal</p>

```bash
meteor add iron:router
```
We'll use Iron Router's server side routes feature to create the URLs or "endpoints" that users will visit to interact with our API.

<p class="block-header">Terminal</p>

```bash
meteor add check
```
We'll use the `Match.test()` method given to us by the check package to validate request parameters that users send to us.

<p class="block-header">Terminal</p>

```bash
meteor add random
```
We'll use the Random package to help us generate our API keys that users will include to authenticate their requests.

<p class="block-header">Terminal</p>

```bash
meteor add http
```
We'll use the HTTP package to help us test out our API once we're all done.

<div class="note">
  <h3>Additional Packages <i class="fa fa-warning"></i></h3>
  <p>This recipe relies on several other packages that come as part of <a href="https://github.com/themeteorchef/base">Base</a>, the boilerplate kit used here on The Meteor Chef. The packages listed above are merely recipe-specific additions to the packages that are included by default in the kit. Make sure to reference the <a href="https://github.com/themeteorchef/base#packages-included">Packages Included list</a> for Base to ensure you have fulfilled all of the dependencies.</p>
</div>

### Terminology
There are a handful of terms that will be used throughout this recipe that would be helpful to clarify now. If you're already familiar with APIs and the lingo that people use to talk about them, you can skip this part. If you're new to the scene, pull up a chair and we'll get you up to speed.

#### API
When it comes to software development, `API`—or, Application Programming Interface—is generally acknowledged as the methods, functions, or data that an application exposes for other software to use. This makes it possible for applications to work together without requiring direct collaboration between any two development teams. 

In the context of this recipe, `API` will refer to the data and functions developers can access in our application via URLs or endpoints.

#### Endpoint
An `endpoint` is the URL that developers use to gain access to data or functionality in our application. For example, `http://website.com/api/v1/pizzas/toppings.json` is an endpoint that will return data, while `http://website.com/api/v1/pizzas/update` is an endpoint that can access functionality to update a pizza. If this is confusing, don't worry, it will make sense when we implement our own API later on.

#### Resource
A `resource` is the actual _thing_ in our application that a user is consuming. Resources are accessed either in the form of groups (also referred to as collections), or on their own. For example, the endpoint `http://website.com/api/v1/pizzas` is meant to point us to the _pizzas_ resource, or, all of the data and functions related to pizzas. Conversely, the endpoint `http://website.com/api/v1/toppings` points us to the _toppings_ resource. 

#### Request
A `request` is the term used to refer to the action performed by another application on our API. A request is made to an endpoint and usually contains some sort of data that we can use to _fulfill_ that request. For example, a user may request to create a new pizza in our application and in order to fulfill that request, we'd need to know the name of the pizza, what toppings it would have on it, and what type of crust it would have.

#### Response
A `response` is the term used to refer to our application responding to the request of another application. Depending on the type of request made by the other application our response will contain a status code—a three digit number that lets the other application know whether their request succeeded—and/or the data they requested, or a message confirming their action.

#### HTTP Verbs
HTTP verbs—or methods—are the different types of requests that a user can make on our API. The four types/verbs we'll focus on in this recipe are `GET`, `POST`, `PUT`, and `DELETE`. Each verb corresponds to a different type of action that our API can use to delegate the user's request to the right data or functionality that our API exposes.

#### HTTP Status Code
An `HTTP Status Code` is a three-digit number that an application can use to describe the result of a certain request. For example, if an action was successful an application might respond with `200` or `OK`. If a user made a request for some data that could not be found, an application would respond with `404` or `Not Found`. There are [several HTTP Status Codes](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) that applications can use to communicate the results of actions with one another.
 
#### API Key
An `API Key` is a unique identifier used by an API to _authenticate_ requests from users. It's generally presented in the form of a long, hexadecimal string (usually 32 characters or more). API Keys are randomly generated and can be issued (generated) or revoked (made invalid).

### An API for pizza
To make our work a little easier to understand, we'll be creating an API that allows our users to do the following:

- Get a pizza from our database by name, topping(s), or crust.
- Create a new pizza in our database with a name, topping(s), and crust.
- Update an existing pizza in our database with a name, topping(s), or crust.
- Delete an existing pizza in our database.

Pizza! To get us started off on the right foot, we're going to begin by focusing on issuing and revoking API tokens for our users. This will ensure that we're thinking about security from the start and not tacking it on later.

### Issuing API keys

In order for users to access our API, we need some sort of authentication. When users login to our application's graphical interface, they just use a username and password. When they access our API, though, we'd like to use something that's a little more secure.

An API key allows us to accomplish this because of a few properties:

1. It's a long, random, difficult to guess (unlike, potentially, a password) string of characters.
2. It can be used to reference a user's account ID without compromising their username and password.
3. It can be reset, meaning if a security breach _does_ occur, a user can invalidate an API key making it useless to anyone who uses it.

For our API, we're going to issue API keys in two ways: once, when the user signs up for our application and then again, whenever they click the "regenerate key" button in their profile.

Let's get started by taking a look at how we accomplish this when a new user signs up.

#### Generating a key on signup

When our user first signs up, they haven't had a chance to generate an API key so we need to do it on their behalf. To do this, we need to create a server side method that we can call _after_ the user's account has been created that can apply a key to their account by referencing their `userId`. Let's take a look.

<p class="block-header">/server/methods/insert/api-key.js</p>

```javascript
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
```

Super simple, right? We start by using `check()` to verify that our `userId` is equal to the currently logged in user. We also make sure to check for a plain `String` value, too, as this could break when we auto-generate a user on startup (they exist in the DB but are not logged in). Next, we generate a new API key for them using the Random package's `hexString()` method. Note: here we pass the number `32` meaning we want our randomly generated key to be 32 characters in length. This number can be customized, so if you want more or less security, you can change it to fit your needs.

Next, we `try` to insert a new key for our user into the `APIKeys` collection. Wait a minute! Where did this come from?! This collection was [setup beforehand](https://github.com/themeteorchef/writing-an-api/blob/master/code/collections/api-keys.js), but let's talk about _why_ we have a separate collection to begin with. The reason we want to separate our API key storage from the more predictable location of our user's `profile` (the writable portion of a user's record in the `Meteor.users()` collection) is that [by default, the `profile` object is _writable_](http://joshowens.me/the-curious-case-of-the-unknowing-leaky-meteor-security/). 

This means that without any extra considerations, were we to store our user's API key in their profile, _anyone_ with our user's ID could update the key (if our user documents were published to the client). Even though the code for this recipe has [already taken this into consideration](https://github.com/themeteorchef/base/blob/master/collections/users.js), it's still good to separate concerns a bit. Keep in mind, **this isn't bulletproof** and it's still recommended that your users practice good security by keeping their information safe from unwanted hands.

<div class="info note">
  <h3>Educating in the UI <i class="fa fa-info"></i></h3>
  <p>Because practicing good security is important, a good practice is educating users in your UI. Wherever they interact with their API key, make suggestions about how best to store and protect their key from unwanted eyes.</p>
</div>

#### Baking this into the signup flow

Okay, so we have our method setup, but when and where do we actually call it? Let's take a look at the logic for our signup form (given to us as [part of Base](https://github.com/themeteorchef/base/blob/master/client/controllers/public/signup.js)).

<p class="block-header">/client/controllers/public/signup.js</p>

```javascript
Accounts.createUser({email: user.email, password: user.password}, function( error ){
  if(error){
    Bert.alert(error.reason, 'danger');
  } else {
    var userId = Meteor.userId();
    Bert.alert('Welcome!', 'success');
    Meteor.call( "initApiKey", userId );
  }
});
```

See the call? The last line in our `Accounts.createUser()` callback. We simply call our  `initApiKey` method _after_ our user's account has been created (and they've been logged in—why we're using the call to `Meteor.userId()`). We're passing the user's ID to our method so we can pair the API key we generate to the user. Nice and simple! Now that we have this in place, let's take a look at how we display the key back to our user so they can use it in their HTTP requests as well as regenerate it.

#### Key display and regeneration

Okay! We have a key, but how do we see it and regenerate it? Let's take a look at our `apiKey` template first so we can understand how everything is structured.

<p class="block-header">/client/views/authenticated/api-key.html</p>

```markup
<template name="apiKey">
  <div class="row">
    <div class="col-xs-12 col-sm-6">
      <h4 class="page-header">API Key</h4>
      <p>To gain access to the Pizza API, use the following API Key. Make sure to keep it super safe! <strong>If you'd like to generate a new key, click the "refresh" icon on the field below</strong>.</p>
      <label class="sr-only" for="apiKey">Your API Key</label>
      <div class="input-group">
        <input type="text" readonly class="form-control" id="apiKey" placeholder="API Key" value="{{apiKey}}">
        <div class="input-group-addon regenerate-api-key"><i class="fa fa-refresh"></i></div>
      </div>
    </div>
  </div> <!-- end .row -->
</template>
``` 
The part we want to focus on is between the `<div class="input-group">` near the bottom. Here, we have a disabled input field to display our key (this could be plain text, too) with a "cap" containing an icon to reset the API key. Note: the current API key is set as the value of the input. What we want to accomplish is getting our API key to display in the input and automatically update with a _new_ key when we click on the "cap" of the input. Let's see how to do it.

<p class="block-header">/client/controllers/authenticated/api-key.js</p> 

```javascript
Template.apiKey.onCreated(function(){
  this.subscribe( "APIKey" );
});
```

First, we need a way to _see_ our API key. In order to do this, we can make use of Meteor's new [template-level subscriptions](http://docs.meteor.com/#/full/Blaze-TemplateInstance-subscribe) to subscribe to our data. So it's clear, let's look at the publication this subscription is calling on real quick.

<p class="block-header">/server/publications/api-key.js</p>

```javascript
Meteor.publish( 'APIKey', function(){
  var user = this.userId;
  var data = APIKeys.find( { "owner": user }, {fields: { "key": 1 } } );

  if ( data ) {
    return data;
  }

  return this.ready();
});
```

See the connection? Pretty simple. Of note, here we make it possible to find our current user's API key by using the handy `this.userId` value that Meteor gives us access to inside of publications. This way we don't have to pass the user's ID with our subscribe call. Nice! Next, we make sure to pass a projection to our `find`, returning only the `key` field (omitting the user's ID from the response). Every little bit of efficiency counts! Okay, let's see how we're piping the API key into the template.

<p class="block-header">/client/controllers/authenticated/api-key.js</p>

```javascript
Template.apiKey.helpers({
  apiKey: function() {
    var apiKey = APIKeys.findOne();

    if ( apiKey ) {
      return apiKey.key;
    }
  }
});
```
Straightforward enough. We simply do a `findOne()` and return the response (if it exists) to our `{{apiKey}}` helper. But wait...how are we doing this without a query or projections? Well, because we know that our publication is going to return only the document that matches our current user's ID _and_ only the `key` field, we can do a `findOne` because our template will only ever see _one document_. Make sense? No sense in writing extra code when the job is already finished! Now that getting our key into the template is square, let's check out regeneration.

<p class="block-header">/client/controllers/authenticated/api-key.js</p>

```javascript
Template.apiKey.events({
  'click .regenerate-api-key': function( ){
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
```
Two steps here. Because the regeneration action is _destructive_ meaning once this button is pushed the current API key is completely overwritten, we need to ask the user if they're sure. So, who cares? Well, as we'll learn in a bit, only the currently set API key is active. Again, this is a security measure so that if a key is leaked, our user can generate a new one effectively invalidating the old one. This means that if someone were to try and make an HTTP request on our API using that old key, they'd get an error! We are _so considerate_ of our users. 

![David Mitchell pointing](http://media.giphy.com/media/n988gduPMFC8w/giphy.gif)

Alright! Let's hop over to the server and take a look at how this is working.

<p class="block-header">/server/methods/update/api-key.js</p>

```javascript
Meteor.methods({
  regenerateApiKey: function( userId ){
    check( userId, Meteor.userId() );

    var newKey = Random.hexString( 32 );

    try {
      var keyId = APIKeys.update( { "owner": userId }, {
        $set: {
          "key": newKey
        }
      });
      return keyId;
    } catch(exception) {
      return exception;
    }
  }
});
```

Almost identical to our `initApiKey` method from our signup flow, but with one small difference. Because we want to update an existing API key, we first want to look up the key in the database by the user's ID and _then_ set the key. Cool! With this in place, our user can click and confirm the regeneration on the client and get a fresh key in the input field we set up. Party!

Things are looking great! We're ready to rock on implementing our actual API. We'll start by setting up the structure of our API so working on it is a little easier.

### Setting up our API

_How_ we structure our API is just as important as the functionality that API provides. Technically speaking, our API is just another interface into our application, albeit not visual. Just like a graphical interface, though, we need to be considerate of how our API is organized because:

1. It makes it easier for our users to interact with.
2. It makes it easier for _us_ to maintain and expand.

With that, said, let's look at our folder structure real quick.

```bash
/server
--- /api
------ /config
--------- api.js
------ /resources
--------- pizza.js
```

What's going on here? First, we treat our API almost like a separate application. Even though it's stored in the `/server` directory of our app, all of the code related to the API is sectioned off in its own directory. This is mostly for clarity and helps us to separate concerns around what code is responsible for what actions. Second, we break up the API into its different pieces. 

For this recipe, we have two parts: configuration and resources. Configuration—and more specifically our `api.js` file—is where we'll store a single object containing all of the methods and functions our API needs to function. Resources, on the other hand, are where we keep the available actions for each type of data. We'll only showcase one resource in this recipe, but a real API is likely to have multiple resources so its good to demonstrate the separation.

#### A single API object

To keep things simple and act as an aid to help us keep our code [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself), we've defined a single object—set to the global variable `API`—in `/api/config/api.js` containing all of the code for our API. Let's take a look at the skeleton of the API to see what we mean.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  authentication: function( apiKey ) {},
  connection: function( request ) {},
  handleRequest: function( context, resource, method ) {},
  methods: {
    pizza: {
      GET: function( context, connection ) {},
      POST: function( context, connection ) {},
      PUT: function( context, connection ) {},
      DELETE: function( context, connection ) {}
    }
  },
  resources: {},
  utility: {
    getRequestContents: function( request ) {},
    hasData: function( data ) {},
    response: function( context, statusCode, data ) {},
    validate: function( data, pattern ) {}
  }
};
```
Wow! This is a lot. Don't worry, we'll step through each piece so it makes sense. All we want to point out here is that we're consolidating everything in our API into one place. Again, this is just an organizational technique to slim down our code and make it easier to reason about what functionality we have access to. As we build out each of the objects and functions inside of our `API` object, you will start to see why this structure is convenient.

Let's get started by defining our resources.

### Defining our resources

For this recipe, we actually only have on resource: pizza. Recall that a resource is simply the thing in our application that a user is consuming. In order for them to consume it, we need to make that resource accessible at an _endpoint_. Again, an endpoint is simply a fancy name for a URL (or URI depending on [which way your door swings](https://danielmiessler.com/study/url_vs_uri/)). 

To do this, we're going to use Iron Router's server side routing feature. First, let's look at how our route is defined and then dive into how we use it.

<p class="block-header">/server/api/resources/pizza.js</p>

```javascript
Router.route( '/api/v1/pizza', function() {
  // This is where we handle the request.
}, { where: 'server' } );
```

Pretty simple, right? If you've worked with Iron Router before, this should look familiar. We're doing three things here:

1. Passing a `path` parameter to let Iron Router know what URL (relative to our application's domain) our resource will be accessible at.
2. A callback function that will be called whenever our route is visited.
3. An `options` parameter with a `where` setting set to `'server'`.

When we define a route like this on the server, we end up giving this route access to Node's `request` and `response` methods. These are what we'll use to communicate with HTTP requests. Again, the `request` being what we _receive_ and `response` being what we _send back_. Let's look at how we're actually using this for our own API.

<div class="note">
  <h3>API Versioning <i class="fa fa-warning"></i></h3>
  <p>You may have noticed that the URL for our endpoints is prefixed with /api/v1. What's that? Just like a piece of software, we want to version our API so that consumers of our API know what functionality they have access to with each iteration.</p> <p>For example, we might want to change an endpoint's URL but we don't want to break the existing version. What we can do, then, is create a new version of our API, prefixing all new URLs with the new version. Because this is the <em>first</em> iteration of our API, we prefix all of our URLs with /api/v1/. In the future, we'll keep all of our /api/v1/ urls accessible, while still allowing us to expand our API by changing out the version number.</p>
<p>This is honestly a bit heady and confusing at first. I highly recommend checking out <a href="http://www.heavybit.com/library/video/2014-09-30-amber-feng">this talk by Amber Feng, the Product Engineering Lead at Stripe</a>. In it she discusses some of the design principles behind their API. It's well worth the half hour watch if you want to start thinking seriously about the design of your API. Food for thought!</p>
</div>

<p class="block-header">/server/api/resources/pizza.js</p>

```javascript
Router.route( '/api/v1/pizza', function() {
  this.response.setHeader( 'Access-Control-Allow-Origin', '*' );

  if ( this.request.method === "OPTIONS" ) {
    this.response.setHeader( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept' );
    this.response.setHeader( 'Access-Control-Allow-Methods', 'POST, PUT, GET, DELETE, OPTIONS' );
    this.response.end( 'Set OPTIONS.' );
  } else {
    API.handleRequest( this, 'pizza', this.request.method );
  }

}, { where: 'server' } );
```

What in the blue blazes is _this_? Welcome, friend, to the wild west that is handling HTTP requests. This isn't as scary as it looks, but it is important to pay attention. Otherwise prepare to sink countless hours into fighting with CORS.

What is CORS, you ask? [CORS (Cross Origin Resource Sharing)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) is a standard used by browser makers to handle secure communication between web servers using HTTP. In theory, CORS is great. It should allow us to easily define who is allowed to communicate with our application and _what_ they're allowed to share with us. If only it were that easy.

#### Pre-flight OPTIONS requests

When an HTTP request is made to our server from an origin (domain) other than the one where the app is living, CORS will perform a process known as "pre-flight." This means that before an actual request is processed, CORS will call to the server being requested to make sure that it's allowed to send the request as well as what it's allowed to send with it. This is like that super paranoid parent calling ahead to the pool party to make sure a life guard will be on duty in case Little Jimmy gets tangled up in one of his pool noodles. _Sigh_.

What you see in the example above is how we need to negotiate this `OPTIONS` request. First, we "globally" (meaning for any type of HTTP request, `OPTIONS` or otherwise) set something called `Access-Control-Allow-Origin`. This rule says from which domains a request is allowed to come from. Here, we've set this to `*` (an asterisk) to say "any domain can send us a request." Keep in mind, you may not always want to do this. If your API requires significant security, invest some time into researching this setting so that you only allow the domains you really want making requests.

Next, we test our request's method to see if it _is_ an `OPTIONS` method and if its, we do three things:

1. Set the `Access-Control-Allow-Headers` parameter to let our request know which HTTP headers are safe to send with the request.
2. Set the `Access-Control-Allow-Methods` parameter to let our request know which type of HTTP requests we allow.
3. End the response to the `OPTIONS` request passing an arbitrary message.

What this accomplishes is a phone call back to Little Jimmy's parents saying "yes, a life guard will be on duty," or, "here is how you're allowed to communicate with this server." Make sense?

<div class="note">
  <h3>CORS is a pain</h3>
  <p>While I've simplified it down quite a bit here, don't let it fool you: CORS is a jerk. It took quite a bit of time to find the solution you see above. This <em>should</em> cover you for most cases, but fair warning, CORS will drive you insane depending on what you want to accomplish.</p>
</div>

Now that CORS is handled, we can dig into _actually_ handling our request.

### Handling requests
Okay. We've got our endpoint all ready to go so now we need to start talking about handling requests. Remember, we're going to focus on handling the four most popular types of requests: `GET`, `POST`, `PUT`, and `DELETE`. This is where we're going to put on our engineering cap, so pay close attention. Our goal is to bake all of our functionality into our `API` object in such a way that we can reuse pieces and avoid duplication. Let's dig in!

#### handleRequest

Because all of our requests will need to perform some common tasks that are not specific to the _type_ of request, we want to create a function that acts as a common starting point for _all_ of our requests. We're going to do something a bit funky and show how we're going to _call_ this common function before we actually define it.

<p class="block-header">/server/api/resources/pizza.js</p>

```javascript
API.handleRequest( this, 'pizza', this.request.method );
```

Woah buddy. What the heck is going on here? Each of our requests will need to perform some common tasks like authentication and getting data _out of the request_. The `handleRequest` function that we're going to define below will be responsible for taking in arguments specific to the type of request and then _delegating_ those to the right methods. Let that sink in. Think of `handleRequst` like the post office clerk sorting mail. It will put the right letters (requests) into the right mailboxes (methods). Stick with me, this will start to make sense in a bit.

Here, we're passing three arguments: `context`, `resource`, and `method`. `context` being passed as `this` is referring to the context within which `handleRequest` is being called, or, _the current request_ being made to the API. `resource` is simply referring to the resource we want to interact with and `method` is the type of method we're trying to perform. Let's hop over to the definition for `handleRequest` to see how this is wired up.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  handleRequest: function( context, resource, method ) {
    var connection = API.connection( context.request );
    if ( !connection.error ) {
      API.methods[ resource ][ method ]( context, connection );
    } else {
      API.utility.response( context, 401, connection );
    }
  }
};
```
Whaaaaat is this?! Don't panic. Again, we're just delegating here. Because there are a handful of steps to perform _before_ we get to interacting with the API, we want to divvy up each task to _a single function_. This helps not only with reusability, but makes it easier to come back to our code later and understand how information is flowing. We'll look at this line by line. Get ready for a bit of Inception.

#### API.connection
When a user "connects" to our API, we need to do two things: authenticate their access and pull the relevant data out of their request. Let's take a look.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  connection: function( request ) {
    var getRequestContents = API.utility.getRequestContents( request ),
        apiKey             = getRequestContents.api_key,
        validUser          = API.authentication( apiKey );

    if ( validUser ) {
      delete getRequestContents.api_key;
      return { owner: validUser, data: getRequestContents };
    } else {
      return { error: 401, message: "Invalid API key." };
    }
  },
};
```

Hang in there. This first step, `connection` is responsible for pulling apart our request to get some information. First, we need to get our user's API key. In order to authenticate each of their requests, we ask that our users pass their API key as part of either the `query` parameters in their request or, as part of the `body` in their request. We'll see how our user sets these later. For now, just know that we ask our users to store their API key in either the `query` or `body` object as a parameter labeled `api_key`. 

To get the actual `api_key` value, we first use a method called `getRequestContents`. This method takes our `request` object and returns the correct object, `query` or `body`, depending on the type of request. That may be a little confusing, let's take a look.

#### utility.getRequestContents

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
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
    }
  }
};
```

See what's happening here? We're using a JavaScript switch method to look at what type of method is being called ( `GET`, `POST`, `PUT`, or `DELETE`), returning the object where we expect our data to be passed. `GET` requests are expected to pass data in the `query` object, while `POST`, `PUT`, and `DELETE` are expected to pass data in the `body` object. This just keeps our code a little cleaner! Awesome. 

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  connection: function( request ) {
    var getRequestContents = API.utility.getRequestContents( request ),
        apiKey             = getRequestContents.api_key,
        validUser          = API.authentication( apiKey );
    [...]
  },
};
```

Back in our `connection` method, once we have the `query` or `body` object, we can pull out our API key. Let's take a look at how we authenticate requests so this all makes sense.

#### Authenticating requests

Our authentication process is pretty simple. We want to do two things:
1. Make sure the API key we've received actually _exists_.
2. Get the `owner` field for that key (the user's ID).

```javascript
API = {
  authentication: function( apiKey ) {
    var getUser = APIKeys.findOne( { "key": apiKey }, { fields: { "owner": 1 } } );
    if ( getUser ) {
      return getUser.owner;
    } else {
      return false;
    }
  }
}
```

Pretty simple, right? We do a `findOne` on our `APIKeys` collection for the key passed by the user. We pass a `fields` projection to retrieve just the `owner` field (our user's ID). If we get a user (meaning our `findOne` doesn't return as `undefined` but as an object), we return the `owner` field. If we don't find a matching API key, we return false. Let's jump back up a level and see how this works.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  connection: function( request ) {
    var getRequestContents = API.utility.getRequestContents( request ),
        apiKey             = getRequestContents.api_key,
        validUser          = API.authentication( apiKey );

    if ( validUser ) {
      delete getRequestContents.api_key;
      return { owner: validUser, data: getRequestContents };
    } else {
      return { error: 401, message: "Invalid API key." };
    }
  },
};
```
See how we're assigning the result of `API.authentication()` to the `validUser` variable? This is allowing us to halt the request and return an error if the API key we've received is invalid. Note that here, we're simply returning an object with an `error` parameter containing an HTTP status code and a `message` parameter to explain what went wrong. We'll look at how this is utilized in a bit. Next, let's look at what happens when an API key _is valid_.

<div class="note success">
   <h3>Take a Break <i class="fa fa-thumbs-up"></i></h3>
   <p>Woof! This is a lot, I know, but the payoff is worth it. Let's take five and grab a snack.</p>
</div>

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  connection: function( request ) {
    [...]

    if ( validUser ) {
      delete getRequestContents.api_key;
      return { owner: validUser, data: getRequestContents };
    } else {
      return { error: 401, message: "Invalid API key." };
    }
  },
};
```

Last step for our connection! With the response of `utility.getRequestContents()` stored in our `getRequestContents` variable, we create a new object to return to the client. Here, we assign two parameters: `owner`, equal to our user's ID obtained during our authentication step, and `data`, the data we just retrieved from the request. Boom! Note: before we assign `getRequestContents` to the `data` parameter, we remove the `api_key` value from it since it's no longer needed.

Let's jump back up to our `handleRequest()` call to see how this all plays out.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  handleRequest: function( context, resource, method ) {
    var connection = API.connection( context.request );
    if ( !connection.error ) {
      API.methods[ resource ][ method ]( context, connection );
    } else {
      API.utility.response( context, 401, connection );
    }
  }
};
```

Okay, back to the top! For now! This should be starting to make some sense. We're taking the result of all that work from our `connection()` method and using it to...do more delegation! Argh! Good god man, are you trying to drive us insane?! No. Not at all.

![Ron Burgandy saying I don't believe you](http://media.giphy.com/media/UTm86phGUMMQE/giphy.gif)

Okay, okay. Back to Adult Town. Let's look at how we're handling that error we returned earlier if a user's API key was bogus. See that `API.utility.response()` thingamajig? That's our next wormhole. Let's jump in.

#### utility.response()

When we're working with HTTP requests, we need to acknowledge them somehow. Just like our user can send us a _request_, we can send them a _response_. It's easy to repeat a lot of code doing this, so again, we've simplified this into a reusable function so we can flex our geek muscles. Shall we?

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  utility: {
    response: function( context, statusCode, data ) {
      context.response.setHeader( 'Content-Type', 'application/json' );
      context.response.statusCode = statusCode;
      context.response.end( JSON.stringify( data ) );
    }
  }
};
```

This is pretty straightforward. We start by setting a header `Content-Type` equal to `application/json`. This lets the requesting server know what type of data we intend to send back. To keep things simple we'll be sending back `JSON` data. This can be a lot of different things, so make sure to set it depending on the _actual_ data your API is responding with.

Once that is set, we need to respond with an HTTP status code. Remember, this is the three digit number that servers use to refer to certain events. We're getting this, here, as an argument to our `utility.response()` method. When we set this, we're telling the requesting server the result of their request.

_Finally_, we're ending our response to the request, passing our data. Here, we use `JSON.stringify()` because...

<blockquote>
   <p>The JSON.stringify() method converts a JavaScript value to a JSON string.</p>
   <cite>&mdash; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify">Mozilla Developer Network</a></cite>
</blockquote>

This means that we can safely transmit our data in our response as `JSON` data. Note: we're doing this because our request is expecting `JSON` data to be returned. Why? Because that's what we told it we're responding with a few lines earlier when we set `context.response.setHeader( 'Content-Type', 'application/json' )`! 

That's it for our `utility.response()` method. Let's jump back up and take a look at how we're (finally) handling the response.

### Handling responses

Okay, this is where the rubber meets the road. When we say "handling responses" what we really mean is fulfilling a request. At this point, we've authenticated our users access to our API and grabbed the data they've lobbed over to us. Now, we want to take a look at what _resource_ the request wants to work with and what _method_ it wants to use. Back in our `handleRequest` method, let's look at how we're making this work...

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  handleRequest: function( context, resource, method ) {
    var connection = API.connection( context.request );
    if ( !connection.error ) {
      API.methods[ resource ][ method ]( context, connection );
    } else {
      API.utility.response( context, 401, connection );
    }
  }
};
```

See that `API.methods[ resource ][ method ]( context, connection );` part? This is taking the resource and method passed to `handleRequest` and pointing it to the corresponding method inside of our `API` object. Notice that, too, we're sending along the context (`this` from our request) and the connection information we've received (the userId associated with the API key we received and the data we pulled out of their request). Let's jump into our `API` object and see how our methods are organized and then step through each to see what they do.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  methods: {
    pizza: {
      GET: function( context, connection ) {},
      POST: function( context, connection ) {},
      PUT: function( context, connection ) {},
      DELETE: function( context, connection ) {}
    }
  },
};
```
See the mapping here? In our `handleRequest` method, we were doing `API.methods[ resource ][ method ]( context, connection )` which is like saying `API.methods.pizza.GET( context, connection );` We use bracket notation to allow for variable object/method names. If we had another resource called `tacos` and we wanted to call its `put` method, we'd get something like `API.methods.tacos.PUT( context, connection );`. Make sense?

Because our resource `pizza` supports `GET`, `POST`, `PUT`, and `DELETE` methods, we've defined a function for each HTTP method that will be called when we receive that type of request. Handy! Now for the fun part: making our methods do something. 

#### GET Methods

`GET` methods are used to retrieve data. They're best thought of as performing a search on another application. We're saying "hey, application, can you give me the pizza that matches the following parameters?" Cool, huh? Let's take a look at the method we've defined in our `API` object at `API.resources.pizza.get` to see how this all works.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  methods: {
    pizza: {
      GET: function( context, connection ) {
        var hasQuery = API.utility.hasData( connection.data );

        if ( hasQuery ) {
          connection.data.owner = connection.owner;
          var getPizzas = Pizza.find( connection.data ).fetch();

          if ( getPizzas.length > 0 ) {
            API.utility.response( context, 200, getPizzas );
          } else {
            API.utility.response( context, 404, { error: 404, message: "No pizzas found, dude." } );
          }
        } else {
          var getPizzas = Pizza.find( { "owner": connection.owner } ).fetch();
          API.utility.response( context, 200, getPizzas );
        }
      }
    }
  },
};
```

Some new stuff, some familiar stuff. Let's step through it. First, we introduce a new utility method `hasData`. This method is designed to help us figure out whether or not our user's request has any data associated with it. Why do we care? Well, we need to know what type of response to give. In a `GET` request, we have two outcomes: returning a specific piece of data, or, returning a collection of data.

The difference here is that if our user has passed some parameters (a.k.a query parameters) with their `GET` request, we know that we want to look for a specific document (or subset of documents) that matches that query. If they _don't_ give us any parameters, we just want to return everything. There's one catch! Remember how our `authentication` method earlier gave us back the user ID? We want to use that here so that we're only getting the documents "owned" by _that user_. 

Before we get too far ahead of ourselves, let's pull apart that `hasData` method.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  utility: {
    hasData: function( data ) {
      return Object.keys( data ).length > 0 ? true : false;
    }
};
```
Easy peasy! But super important. What we're doing here is taking the `data` parameter from our connection object (remember, this is where we stored the data we pulled from the request) and checking whether or not it has any keys (parameters). If it _does_ we return true. If not, we slap a `false` on it. Good? Clear? Kosher? Back up!

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  methods: {
    pizza: {
      GET: function( context, connection ) {
        var hasQuery = API.utility.hasData( connection.data );

        if ( hasQuery ) {
          connection.data.owner = connection.owner;
          var getPizzas = Pizza.find( connection.data ).fetch();

          if ( getPizzas.length > 0 ) {
            API.utility.response( context, 200, getPizzas );
          } else {
            API.utility.response( context, 404, { error: 404, message: "No pizzas found, dude." } );
          }
        } else {
          var getPizzas = Pizza.find( { "owner": connection.owner } ).fetch();
          API.utility.response( context, 200, getPizzas );
        }
      }
    }
  },
};
```

See how we're playing this fiddle? If we _do_ have data, we run a `find` on our `Pizza` collection. Next, we `fetch()` the result of that query (turn it into an array) and then evaluate whether or not it has any items (meaning it found something). If it _did_, we use our handy dandy `response` method we setup earlier to return a `200` (success) status code and then pass our found array of pizzas. Recall that from here, our `response` method will convert that array of objects into a JSON string using `JSON.stringify`. 

Sing it with me, kids: R-E-U-S-A-B-I-L-I-T-Y.

Conversely, here, we also account for us finding _no_ pizzas matching the query. If we get bupkis, we return a 404 (not found) along with a message to let the requester know their query turned up with nothing.

Just a ways down, we also handle what happens when we don't have any query parameters. See it? Instead of passing those parameters to our `find`, we instead just pass the `owner` (user ID). What happens here? Well, if there are _any_ pizzas in the `Pizza` collection where the owner is equal to our user's ID, we'll get them back! All of them! Pizza!

<div class="note success">
  <h3>A working API <i class="fa fa-thumbs-up"></i></h3>
  <p>It may not seem like much, but with this method written we have a WORKING API. HOLY COW. Give yourself a pat on the back, this is huge!</p>
</div> 

Okay, ready to keep swinging? Next up is handling `POST` methods. The good news? We're going to reuse a lot of code from here on out so the next three methods will go quick.

#### POST Methods

`POST` methods are used to insert or _create_ data. Let's take a look.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  methods: {
    pizza: {
      POST: function( context, connection ) {
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
    }
  },
};
```

This should be starting to make a lot of sense! A few things to call out. First, we've added _yet another method_. I know, I know.

![Neil DeGrasse Tyson...whatever](http://media.giphy.com/media/zGZOcFgBDrrBC/giphy.gif)

This one is actually really cool! Can you guess what this is doing? `API.utility.validate( connection.data, { "name": String, "crust": String, "toppings": [ String ] });` Let's jump over and take a look.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  utility: {
    validate: function( data, pattern ) {
      return Match.test( data, pattern );
    }
  }
};
```
Okay, pretty simple...but what is this? Remember our friend the `check()` method? This is its little brother (or sister—we don't discriminate here). When we use `check()` remember that it takes a piece of data and then a pattern to test against. If the passed data doesn't match the pattern, `check()` throws an error. 

`Match.test()` is almost identical, with one little difference. Instead of throwing an error (halting any operations on the server), it just returns `true` or `false`. Because we're presumably handling lots of request, we don't want to use `check()` because it could break the API for everyone else. Using `Match.test()` lets us handle each validation and response _to_ that validation independently.

If you're following along, we're making this reusable to keep everything tidy. Here we pass our data and the pattern we'd like to validate against. Cool! Let's see how make use of the `true`/`false` answer.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  methods: {
    pizza: {
      POST: function( context, connection ) {
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
    }
  },
};
```

So. Notice that what we're saying in our validation pattern is that in a `POST` request, we expect the data to have a `name` parameter with a type of `String`, a `crust` parameter with a type of `String`, and a `toppings` parameter with a type of `Array` that contains `String`s. We partner the response from this up with our `hasData` method from earlier. Combined, they let us know if we have data to actually _insert_ into the database and if that data is valid.

If it is, we perform the insert and send back a positive response. If it's not, though, notice that unlike our `GET` method, we don't return any data. Instead, we send back a 403 error (forbidden) along with a message scolding our user. We let them know that their `POST` request must contain the data we're validating against. 

Now we're cruising! Two left: `PUT` and `DELETE`.

#### PUT Methods

`PUT` methods are used for _updating_ an existing piece of data.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  methods: {
    pizza: {
      PUT: function() {
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
      }
    }
  },
};
```
Woah! This isn't as scary as it looks. At this point we're not introducing anything new, just pushing the limits of what we already have. The first thing to point out is our validation, what is that thing? Well. Because a `PUT` request is all about updating existing objects, we may not always be updating using a `1:1` representation of the existing object (read: same fields each time). To compensate, we need to pass all of the different variations of objects we might get from our user. Seriously?! If we want to be on top of our game, yes. Here, we've simply considered each possible permutation of the object we could receive from our users. 

Again, once we have verified that our data exists and is valid, we go to perform the update. First, though, we verify that the document we're trying to update actually exists. If it does, we carry on, if it doesn't we send back an error letting the user know we can't update something that doesn't exist. Just like our `POST` request, if there's no data or it's invalid, we throw a `403` error letting them know to straighten up their act.

Boom! Last one. Let's do this `DELETE` thing.

#### DELETE Methods

I bet you can guess what a `DELETE` request does? Yup! It deletes something. _Mind blow_. Enough sarcasm, let's check it out.

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  methods: {
    pizza: {
      DELETE: function( context, connection ) {
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
};
```
Almost _too_ simple, yeah? Our usual suspects `hasData` and `validate` take care of business. We use the same test from our `PUT` method to make sure the document we're trying to delete actually exists and if it does: BLAMMO! If either of our tests fail, we throw a `404` or `403` depending on the case.

<div class="note success">
<h3>Take a bow! <i class="fa fa-thumbs-up"></i></h3>
<p>You just wrote an API, friend! It's simple, but it actually handles all of the basic HTTP methods. We can retrieve, create, update, and delete pizzas. Even the Jetsons didn't have it on lockdown like this.</p> 
</div>


### Consuming the API

Before we part ways, it would be helpful to understand how this API is actually _consumed_ by a user. When we say consumed, we really just mean "used." Like, "I'm so hungry, I'm going to use this burger right now." In order to test our methods out, we can make use of the `http` package. We're not going to do too deep of a dive here. Instead, let's just look at examples of each method, showing how the data can be passed.

#### GET request

`GET` requests using the HTTP package will need to pass data using either the `params` object that sits inside of the options object, or, as a string in the `query` parameter formatted like `keyName=value&anotherKey=anotherValue`. That last one, `query`, would be parsed on our server as:

```javascript
{
  keyName: "value",
  anotherKey: "anotherValue"
}
```

<p class="block-header">GET Method</p>

```javascript
HTTP.get( "http://localhost:3000/api/v1/pizza", { 
  params: { 
    "api_key": "Our API key goes here",
    "name": "Pizza Name",
    "crust": "Crust Name",
    "toppings": [ 'an', 'array', 'of', 'toppings' ]
  } 
}, function( error, response ) {
  if ( error ) {
    console.log( error );
  } else {
    console.log( response );
  }
});
```

#### POST request

The `POST` method call is pretty simple. We just pass our data to the `data` object.

<p class="block-header">POST Method</p>

```javascript
HTTP.post( "http://localhost:3000/api/v1/pizza", { 
  data: { 
    "api_key": "Our API key goes here",
    "name": "Pizza Name",
    "crust": "Crust Name",
    "toppings": [ 'an', 'array', 'of', 'toppings' ]
  } 
}, function( error, response ) {
  if ( error ) {
    console.log( error );
  } else {
    console.log( response );
  }
});
```

#### PUT request

`PUT` is the same, but it can include any of our parameters `name`, `crust`, or `toppings`, but _requires_ an `_id` parameter so we know what pizza to update.

<p class="block-header">PUT Method</p>

```javascript
HTTP.put( "http://localhost:3000/api/v1/pizza", { 
  data: { 
    "api_key": "Our API key goes here",
    "_id": "ID of the pizza to update",
    "name": "Pizza Name",
    "crust": "Crust Name",
    "toppings": [ 'an', 'array', 'of', 'toppings' ]
  } 
}, function( error, response ) {
  if ( error ) {
    console.log( error );
  } else {
    console.log( response );
  }
});
```

#### DELETE request

`DELETE` is the most straightforward. We just need a single `_id` parameter to know which pizza to delete.

<p class="block-header">DELETE Method</p>

```javascript
HTTP.del( "http://localhost:3000/api/v1/pizza", { 
  data: { 
    "api_key": "Our API key goes here",
    _id: "ID of the pizza to delete"
  } 
}, function( error, response ) {
  if ( error ) {
    console.log( error );
  } else {
    console.log( response );
  }
});
```

When calling each of these methods (try playing with them in your browser console), you will receive either data or an error back as we defined in each of our response methods! Awesome! 

### Wrap Up & Summary

There we have it! A full blown API, fit for consumption. In this recipe, we learned how to issue and reissue API keys, how to organize our API to keep things reusable and DRY, how to handle requests, how to _respond_ to requests, and finally, how to use the API. This was a lot of work and it is incredibly powerful. Now, you know how to allow other applications and developers to interact with your own application. Using what you learned here, you could build some really cool stuff!

If you come up with your own API, push it to the Meteor servers and share it in the comments!