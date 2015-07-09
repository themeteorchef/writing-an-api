What is our API?

```bash
/api/v1/pizza
```

1. Get a pizza by: name, topping, sauce, or crust.
2. Create a new pizza with: name, toppings, sauce, and crust.
3. Update a pizza with: name, toppings, sauce, or crust.
4. Delete a pizza.

GET
- With query params = specific pizza.
- Without query params = all pizzas.

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
meteor add ajduke:bootstrap-tokenfield
```
We'll use the Bootstrap Tokenfield package to help us with adding comma separated arrays of data to keep user input consistent.

<div class="note">
  <h3>Additional Packages <i class="fa fa-warning"></i></h3>
  <p>This recipe relies on several other packages that come as part of <a href="https://github.com/themeteorchef/base">Base</a>, the boilerplate kit used here on The Meteor Chef. The packages listed above are merely recipe-specific additions to the packages that are included by default in the kit. Make sure to reference the <a href="https://github.com/themeteorchef/base#packages-included">Packages Included list</a> for Base to ensure you have fulfilled all of the dependencies.</p>
</div>

### Terminology
There are a handful of terms that will be used throughout this recipe that would be helpful to clarify now. If you're already familiar with APIs and the lingo that people use to talk about them, you can skip this part. If you're new to the scene, pull up a chair and we'll get you up to speed.

#### API
When it comes to software development, `API`—or, Application Programming Interface—is generally acknowledged as the methods, functions, or data that an application exposes for other software to use. This makes it possible for applications to work together without requiring direct collaboration between any two development teams. 

In the context of this recipe, API will refer to the URLs that developers can use to retrieve, create, update, and delete data in our application.

#### Endpoint
An `endpoint` is the URL that developers use to gain access to data or functionality in our application. For example, `http://website.com/api/v1/pizzas/toppings.json` is an endpoint that will return data, while `http://website.com/api/v1/pizzas/update` is an endpoint that can access functionality to update a pizza. If this is confusing, don't worry, it will make sense when we implement our own API later on.

#### Resource
A `resource` is the actual _thing_ in our application that a user is consuming. Resources are accessed either in the form of groups (also referred to as collections), or on their own. For example, the endpoint `http://website.com/api/v1/pizzas` is meant to point us to the _pizzas_ resource, or, all of the data and functions related to pizzas. Conversely, the endpoint `http://website.com/api/v1/toppings` points us to the _toppings_ resource. 

#### Request
A `request` is the term used to refer to the action performed by another application on our API. A request is made to an endpoint and usually contains some sort of data that we can use to _fulfill_ that request. For example, a user may request to create a new pizza in our application and in order to fulfill that request, we'd need to know the name of the pizza, what toppings it would have on it, and what type of crust it would have.

#### Response
A `response` is the term used to refer to our application responding to the request of another application. Depending on the type of request made by the other application our response will contain a status code—a three digit number that lets the other application know whether their request succeeded—and/or the data they requested, or a message confirming their action.

#### HTTP Verbs
HTTP verbs are the different types of requests that a user can make on our API. The four types/verbs we'll focus on in this recipe are `GET`, `POST`, `PUT`, and `DELETE`. Each verb corresponds to a different type of action that our API can use to delegate the user's request to the right data or functionality that our API exposes.

#### HTTP Status Code
An `HTTP Status Code` is a three-digit number that an application use to describe the result of a certain request. For example, if an action was successful an application might respond with `200` or `OK`. If a user made a request for some data that could not be found, an application would respond with `404` or `Not Found`. There are [several HTTP Status Codes](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) that applications can use to communicate the results of actions with one another.
 
#### API Key
An `API Key` is a unique identifier used by an API to _authenticate_ requests from users. It's generally presented in the form of a long, hexadecimal string (usually 32 characters or more). API Keys are randomly generated and can be issued (generated) or revoked (made invalid).

### An API for pizza
To make our work a little easier to understand, we'll be creating an API that allows our users to do the following:

- Get a pizza from our database by name, topping(s), or crust.
- Create a new pizza in our database with a name, topping(s), and crust.
- Update an existing pizza in our database with a name, topping(s), or crust.
- Delete an existing pizza in our database.

To get us started off on the right foot, we're going to begin by focusing on issuing and revoking API tokens for our users. This will ensure that we're thinking about security from the start and not tacking it on later.

### Issuing API tokens

In order for users to access our API, we need some sort of authentication. When users login to our application's graphical interface, they just use a username and password. When they access our API, though, we'd like to use something that's a little more secure.

An API key allows us to accomplish this because of a few properties:

1. It's a long, difficult to guess (unlike a password) string of characters.
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
    check( userId, String );

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

Super simple, right? We start by using `check()` to verify that our `userId` is a string. Next, we generate a new API key for them using the Random package's `hexString()` method. Note: here we pass the number `23` meaning we want our randomly generated key to be 32 characters in length. This number can be customized, so if you want more or less security, you can change it to fit your needs.

Next, we `try` to insert a new key for our user into the `APIKeys` collection. Wait a minute! Where did this come from?! This collection was [setup beforehand](https://github.com/themeteorchef/writing-an-api/blob/master/code/collections/api-keys.js), but let's talk about _why_ we have a separate collection to begin with. The reason we want to separate our API key storage from the more predictable location of our user's `profile` (the writable portion of a user's record in the `Meteor.users()` collection) is that [by default, the `profile` object is _writable_](http://joshowens.me/the-curious-case-of-the-unknowing-leaky-meteor-security/). 

This means that without any extra considerations, were we to store our user's API key in their profile, if our user documents were published to the client, _anyone_ with our user's ID could update the key. Even though the code for this recipe has [already taken this into consideration](https://github.com/themeteorchef/base/blob/master/collections/users.js), it's still good to separate concerns a bit. Keep in mind, **this isn't bulletproof** and it's still recommended that your users practice good security by keeping their information safe from unwanted hands.

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

See the call? The last line in our `Accounts.createUser()` callback. We simply call our  `initApiKey` method _after_ our user's account has been created (and they've been logged in—why we're using the call to `Meteor.userId()`), passing the user's ID so we can pair a key to the user. Nice and simple! Now that we have this in place, let's take a look at how we display the key back to our user so they can use it in their HTTP requests as well as regenerate it.

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
        <input type="text" disabled class="form-control" id="apiKey" placeholder="API Key" value="{{apiKey}}">
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
Straightforward enough. We simply do a `findOne()` and return the response (if it exists) to our `{{apiKey}}` helper. But wait...how are we doing this without a query or projections? Well, because know that our publication is going to return only the document that matches our current user's ID _and_ only the `key` field, we can do a `findOne` because our template will only ever see _one document_. Make sense? No sense in writing extra code when the job is already finished! Now that getting our key into the template is square, let's check out regeneration.

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

<!-- ![David Mitchell pointing](http://media.giphy.com/media/n988gduPMFC8w/giphy.gif) -->

Alright! Let's hop over to the server and take a look at how this is working.

<p class="block-header">/server/methods/update/api-key.js</p>

```javascript
Meteor.methods({
  regenerateApiKey: function( userId ){
    check( userId, String );

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

Things are lookin great! We're ready to rock on implementing our actual API. We'll start by setting up the structure of our API so working on it is a little easier.

### Setting up our API

_How_ we structure our API is just as important the functionality that API provides. Technically speaking, our API is just another interface into our application, albeit not visual. Just like a graphical interface, though, we need to be considerate of how our API is organized because:

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
      get: function( context, connection ) {},
      post: function( context, connection ) {},
      put: function( context, connection ) {},
      delete: function( context, connection ) {}
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

Let's get started by adding our resources.

### Defining our resources

Recall that a resource is simply the thing in our application that a user is consuming. In order for them to consume it, we need to make that resource accessible at an _endpoint_. Again, an endpoint is simply a fancy name for a URL (or URI depending on [which way your door swings](https://danielmiessler.com/study/url_vs_uri/)). 

To do this, we're going to use Iron Router's server side routing feature, and more specifically, the convenient RESTful API given to us by the package. First, let's look at how Iron Router's documentation explains it and then look at how we're going to abstract it into our `API` object pattern.

```javascript
Router.route('/webhooks/stripe', { where: 'server' })
  .get(function () {
    // GET /webhooks/stripe
  })
  .post(function () {
    // POST /webhooks/stripe
  })
  .put(function () {
    // PUT /webhooks/stripe
  });
```
The idea here is that we define a route passing a path, an options object, and then use a series of chained methods each one corresponding to an HTTP verb. WTF?! Let's step through it.

With Iron Router, we start by defining our route with `Router.route( '/server/side/path', { where: 'server' } )`. If you've worked with Iron Router before, the first argument, the path, should look familiar. This is the URL relative to our application's address (e.g. `http://website.com/server/side/path`) that users will use to call on our API. 

This is just like any URL you'd type into your browser, but with one difference: it's not meant to render anything on the page. In other words, this URL is meant to be accessed by a server using an HTTP request. Robot speak. Later on we'll see _how_ this URL is used to make a request. For now: just trust me. 

The next part `{ where: 'server' }` is used to tell Iron Router that this route should only be accessible on the server, but also that this route should get access to Node's `request` and `response` objects (what we'll use to receive a request and respond to it with). 

Lastly, the `.get()`, `.post()`, and `.put()` are convenience methods that point to a function to be called when that route receives a request using _that_ method. So, if an HTTP request is made using the `POST` method, we'll call the `.post()` method. If it's made with a `GET` method, we'll use the `.get()` method, and so on.

#### Using this with our API object

To keep things simple, we want to break this up into two parts. First, we'll store our route definition inside of our `API` object like so:

<p class="block-header">/server/api/config/api.js</p>

```javascript
API = {
  resources: {
    pizza: Router.route( '/api/v1/pizza', { where: 'server' } )
  },
};
``` 


### Authenticating requests
### Handling responses
### Consuming the API
### Wrap Up & Summary