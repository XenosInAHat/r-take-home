Take-Home -- API Server
=======================

This API server takes GET requests with various query parameters, and returns a list of messages voted on exclusively by users matching those queries.

## Starting the Server
```bash
yarn run start
```

This will serve up the server at http://localhost:3000

This *should* work with npm, but I haven't tested it.

## Testing the Server
The easiest way to test this is just by hitting the URL in your browser, e.g.:
```
http://localhost:3000/?age=18-24,65+,sex=M,income=<20,000,living_enviroment=Rural,Urban
```

### Valid query parameters
| param              |
| ------------------ |
| age                |
| sex                |
| income             |
| living_environment |

You can send several values for each parameter by separating them with commas.

*Note: This server does NOT do any formatting of the query values. They are expected to match the values in the database. Any variation will lead to no messages.*

## Discussion and Considerations
I encapsulated the SQL as much as possible to allow for easy-ish modification.

I split a lot of functionality out into a separate file both to keep the index as clean as possible and to make testing easier.

This server works for the purposes of the take-home task, and should be performant for the given size of the database. However, I'm not entirely sure how performant the SQL statement is; I just wanted to make as few calls to the database as possible.

### Things I'd add/change for production
* Actually build the code and serve a built file rather than serving source. It's fine for this task, but isn't exactly a best practice.
* Add linting support. For a project with 3 files (including one spec file), it seemed like too much overhead for no real benefit.
* Add some real validation for query params. As it is, it might not actually be secure. It doesn't allow for very basic malicious behavior, but there's nothing included that actively prevents bad behavior.
* Modify the responses so the message array is sent as a JSON parameter. This would allow for easier extension of response bodies (e.g. adding an error message to the response)
* Add real documentation for the API (maybe using apidoc).
* Actually format GET parameters to improve ease of use.
