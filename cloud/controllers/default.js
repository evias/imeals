/**
 * LICENSE
 *
 Copyright 2015 Grégory Saive (greg@evias.be)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 *
 * @package iMeals
 * @subpackage Controller
 * @author Grégory Saive <greg@evias.be>
 * @license http://www.apache.org/licenses/LICENSE-2.0
 * @link https://imeals.parseapp.com
**/

module.exports = function(app)
{
  /*******************************************************************************
   * HTTP GET requests handlers for iMeals
   * Following code represents the Default Controller implementation
   * for the iMeals frontend application.
   * @link https://imeals.parseapp.com
   *******************************************************************************/

  /**
   * GET /
   * describes the homepage GET request.
   * this handler describes the frontend web app available after deploying
   * the app. Visitors can fill their cart and order delivery with the
   * available modules.
   **/
  app.get('/', function(request, response)
  {
    var error   = request.query.error;
    var success = request.query.success;

    response.render('front/homepage', {
      "errorMessage": error ? unescape(error) : false,
      "successMessage": success ? unescape(success) : false
    });
  });

  /**
   * GET /signin
   * describes the signin GET request.
   * this handler will render the login view.
   **/
  app.get('/signin', function(request, response)
  {
    var currentUser = Parse.User.current();
    if (currentUser)
      response.redirect("/");
    else
      response.render('front/login', {
        "errorMessage": false});
  });

  /**
   * GET /signup
   * describes the signup GET request.
   * this handler will render the signup view.
   **/
  app.get('/signup', function(request, response)
  {
    var currentUser = Parse.User.current();
    if (currentUser)
      response.redirect("/");
    else {
      var formValues = {
        "username": "",
        "email": "",
      };
      response.render('front/signup', {
        "formValues": formValues,
        "errorMessage": false});
    }
  });

  /**
   * GET /signout
   * describes the signout GET request.
   * this handler will redirect to the /signin
   **/
  app.get('/signout', function(request, response)
  {
    Parse.User.logOut();
    request.session = null;

    response.redirect("/signin");
  });

  /*******************************************************************************
   * HTTP POST requests handlers for iMeals
   * @link https://imeals.parseapp.com
   *******************************************************************************/

  /**
   * POST /signin
   * describes the signin POST request.
   * this handler is where we authenticate
   * a Parse.User session using the provided
   * signin form data.
   **/
  app.post('/signin', function(request, response)
  {
    var username = request.body.username;
    var password = request.body.password;

    currentUser  = Parse.User.logIn(username, password, {
      success: function(currentUser) {
        // user authentication credentials are OK, we can
        // now safely save the session token for this user
        // and finally redirect to the homepage.

        request.session.loggedState  = true;
        request.session.sessionToken = currentUser.getSessionToken();

        response.redirect("/");
      },
      error: function(currentUser, error) {
        request.session = null;

        response.render('front/login', {
          "errorMessage": error.message});
      }
    });
  });

  /**
   * POST /signup
   * describes the signup POST request.
   * this handler is where we register new
   * Parse.User entries.
   **/
  app.post('/signup', function(request, response)
  {
    var username = request.body.username;
    var email    = request.body.username;
    var password = request.body.password;
    var pwconfirm = request.body.pwconfirm;

    var formValues = {
      "username": username,
      "email": email
    };

    errors = [];
    if (!email || !email.length || !username || !username.length)
      errors.push("The Email adress may not be empty.");

    if (!password || !password.length)
      errors.push("The Password may not be empty.");

    if (password != pwconfirm)
      errors.push("The Passwords do not match !");

    if (errors.length)
    // refresh with error messages displayed
      response.render("signup", {
        "formValues": formValues,
        "errorMessage": errors.join(" ", errors)});
    else {
    // sign-up user !
      var currentUser = new Parse.User();
      currentUser.set("username", username);
      currentUser.set("email", email);
      currentUser.set("password", password);
      currentUser.set("aclRole", "Guest");

      currentUser.signUp(null, {
      success: function(currentUser) {
        // user registration was successfully done
        // we can now safely save the session token
        // and redirect the user to the homepage

        request.session.loggedState  = true;
        request.session.sessionToken = currentUser.getSessionToken();
        response.redirect("/");
      },
      error: function(currentUser, error) {
        request.session = null;

        response.render('front/signup', {
          "formValues": formValues,
          "errorMessage": error.message});
      }});
    }
  });
}
