Mongoose store adapter for [express-brute](https://github.com/AdamPflug/express-brute).

[![NPM](https://nodei.co/npm/express-brute-mongoose.png?compact=true)](https://npmjs.org/package/express-brute-mongoose)

## Installation

~~~
npm install express-brute-mongoose
~~~

## Usage

~~~javascript
var ExpressBrute = require('express-brute'),
var MongooseStore = require('express-brute-mongoose');
var bruteForceSchema = require('express-brute-mongoose/dist/schema');
var MongooseClient = require('mongoose');

var model = mongoose.model('bruteforce', BruteForceSchema);
var store = new MongooseStore(model);

var bruteforce = new ExpressBrute(store);

app.post('/auth',
  bruteforce.prevent, // error 403 if we hit this route too often
  function (req, res, next) {
    res.send('Success!');
  }
);
~~~

## Defining your Mongoose Schema

You can either use the default schema provided at `express-brute-mongoose/schema` or roll your own, as long as it matches the basic structural requirements of the schema as follows:

~~~javascript
{
  "_id": String,
  "data": {
    "count": Number,
    "lastRequest": Date,
    "firstRequest": Date
  },
  "expires": Date
}
~~~

The **default schema** included in the package includes a Mongo index on the `_id` field and another index that will automatically delete each entry 1 day after it has passed its `expires` time, in an effort to keep the collection clean.

## Development

Build the package with
`npm run compile`

Run tests with
`npm run test`

Run the linter with
`npm run lint`
