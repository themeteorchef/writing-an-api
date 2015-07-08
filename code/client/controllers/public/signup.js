/*
* Controller: Signup
* Template: /client/views/public/signup.html
*/

/*
* Rendered
*/

Template.signup.onRendered(function(){
  $('#application-signup').validate({
    rules: {
      emailAddress: {
        required: true,
        email: true
      },
      password: {
        required: true,
        minlength: 6
      }
    },
    messages: {
      emailAddress: {
        required: "Please enter your email address to sign up.",
        email: "Please enter a valid email address."
      },
      password: {
        required: "Please enter a password to sign up.",
        minlength: "Please use at least six characters."
      }
    },
    submitHandler: function(){
      // Grab the user's details.
      var user = {
        email: $('[name="emailAddress"]').val(),
        password: $('[name="password"]').val()
      };

      // Create the user's account.
      Accounts.createUser({email: user.email, password: user.password}, function( error ){
        if(error){
          Bert.alert(error.reason, 'danger');
        } else {
          var userId = Meteor.userId();
          Bert.alert('Welcome!', 'success');
          Meteor.call( "initApiKey", userId );
        }
      });
    }
  });
});

/*
* Events
*/

Template.signup.events({
  'submit form': function(e){
    // Prevent form from submitting.
    e.preventDefault();
  }
});
