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

In order for users to access our API, 

### Defining our resources
### Authenticating requests
### Handling responses
### Consuming the API
### Wrap Up & Summary