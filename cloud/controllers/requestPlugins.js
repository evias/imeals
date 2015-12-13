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
  crypto  = require('crypto');

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
    var sessionToken = req.session.sessionToken ? req.session.sessionToken : "invalidSessionToken";
    var currentUser  = Parse.User.current();
    if (! currentUser) {
      Parse.User
        .become(sessionToken)
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
    }
    else
      next();
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

}
