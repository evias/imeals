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
 * @subpackage Router
 * @author Grégory Saive <greg@evias.be>
 * @license http://www.apache.org/licenses/LICENSE-2.0
 * @link https://imeals.parseapp.com
**/

models    = require("cloud/models.js");
core      = require("cloud/core.js");

// dependencies
crypto  = require('crypto');
express = require('express');

// express app
app = express();

app.set('views', 'cloud/views');
app.set('view engine', 'ejs');
app.use(express.bodyParser());
app.use(express.cookieParser());

// cookie session security, initialized with random
// hashes. hash creation resolved through sha1 of:
// iMeals by Grégory Saive - Secret Key X
app.use(express.cookieSession({
  name: "iMeals",
  keys: [
    "4187c220dde05025a878e823410bef6d0b8c604f",
    "ca4752cea947b404e803f503194e3489a415e6cc",
    "1d9546a4930ae1fcfbf1b818bd7a23ce5f57fdf3",
    "b8ac4006b48b7b87da28ca7cab25371dfab90c7b",
    "87621280299dbafa72a8511241bbee35ef49919d"
  ],
  secret: "ca8d4ed0467c9044e216c6fad62fe24beedf8ff1"}));

/*******************************************************************************
 * PRE-HTTP requests handlers for iMeals
 * These functions act as Plugins to the HTTP handlers.
 * @link https://imeals.parseapp.com
 *******************************************************************************/

/**
 * Session management PRE-HTTP request handler.
 * This function will try to retrieve a valid session token
 * and call Parse.User.become() with it in order for Parse.User
 * method current() to return the correct request initiating user
 * object.
 **/
app.use(function(req, res, next)
{
  Parse.User
    .become(req.session.sessionToken ? req.session.sessionToken : "invalidSessionToken")
    .then(
      function(currentUser) {
        // currentUser now contains the BROWSER's logged in user.
        // Parse.User.current() for `req` will return the browsers user as well.

        next();
      },
      function(error) {
        // not logged in => will result in redirection to /signin
        next();
      });
});

/**
 * Fill default local request variables.
 * This method fills the variables :
 * - currentUser   : Parse.User instance or boolean false
 * - userHash      : user hash String (SHA-1)
 * - iMealsConfig  : Parse.Config for this Parse App instance
 **/
app.use(function(req, res, next)
{
  var currentUser = Parse.User.current();
  if (! currentUser)
    currentUser = false;

  var ipAddress = req.connection.remoteAddress;
  var userAgent = req.headers['user-agent'];
  var userHash  = crypto.createHash("sha1")
                        .update(userAgent + "@" + ipAddress)
                        .digest("hex");

  res.locals.currentUser  = currentUser;
  res.locals.userHash     = userHash;

  // load Parse App Parse.Config and store into
  // template locals.
  Parse.Config.get().then(
    function(config)
    {
      res.locals.iMealsConfig  = config;
      next();
    });
});

/**
 * Middleware for handling modules of the application.
 * This middleware defines all the applications possible request
 * handlers. see files for more details.
 **/
require('cloud/controllers/default.js')(app);
require('cloud/controllers/admin.js')(app);

// Attach the Express app to Cloud Code.
app.listen();
