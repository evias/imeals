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

// dependencies
express = require('express');

// express apps (modules)
app = express();
api = express();
admin = express();

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

/**
 * Middleware for handling modules of the application.
 * This middleware defines all the applications possible request
 * handlers. see files for more details.
 **/
require('cloud/controllers/requestPlugins.js')(app);
require('cloud/controllers/default.js')(app);

require('cloud/controllers/admin.js')(admin);
app.use("/admin", admin);

require('cloud/controllers/api.js')(api);
app.use("/api", api);

// Attach the Express apps to Cloud Code.
app.listen();
