RundownD
========

Daemon to accept and display event notifications

### Testing it out

In the project's root directory...

```sh
$ npm install
$ gulp gen-data-fixture
$ npm start
```

Now in a browser, visit `http://localhost:3000/` in order to see the "rundown".

You can then trigger updates by hitting a URL as follows:

`http://localhost:3000/notify?target=Stage&branch=my_other_branch&project=MyCms&user=jenkins`

...taking care to use the group params as defined in the supplied config (this will be `./exampleConfig.js` when using `npm start`

You can also run `$ gulp demo-notify` in order to simulate traffic based on the exampleConfig.js.  Data is written to `data/default.json` by default, so you can delete this file if you want to clear the rundown screen.