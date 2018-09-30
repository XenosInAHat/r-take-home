const _ = require('lodash');

const validFilters = ['age', 'sex', 'income', 'living_enviroment',];

function isValidFilter(filter) {
  return validFilters.indexOf(filter) > -1;
}

// Prevent unknown filters. The downside here is that searching for
// new filters requires updating the validFilters list.
exports.getFilters = (filters) => {
  return _.pickBy(filters, (value, key) => isValidFilter(key));
}

// Rudimentary filter validation. Just checks that the query values
// only contain valid characters (i.e. those that exist in table values)
//   -- doesn't check for nonexistent values
exports.validateFilters = (filters) => {
  if (_.isEmpty(filters)) return false;
  return _.every(filters, (value) => {
    return /^[a-z0-9\\,\+\<\-]+$/i.test(value);
  });
}

// In order of execution:
//   - Get users based on the given filters
//   - Get all messages with votes by users OTHER THAN the above users
//   - Get all messages that aren't the above messages (resulting inspect
//     just messages with votes from the users of interest)
//   - Get text for the above messages
exports.getSql = (filters) => {
  if (_.isEmpty(filters)) return '';

  let messageSql =
    `SELECT text
     FROM messages
     WHERE id IN
      (SELECT DISTINCT message_id
       FROM votes
       WHERE message_id NOT IN
         (SELECT DISTINCT message_id
          FROM votes
          WHERE user_id NOT IN
            (${getUserSql(filters)})))`;

  return messageSql;
}

// Build out valid condition string from list of query values
// and return SQL statement to get all users of interest
getUserSql = (filters) => {
  let userSql = `SELECT id
                 FROM users
                 WHERE`;

  _.each(filters, (val, key) => {
    // This is to handle income values formatted like "100\,000+". We don't
    // want to inadvertantly convert that to "100\','000+".
    let newVal = val.replace('\\,', '*')
                    .replace(/,/g, '\',\'')
                    .replace('*', '\\,');
    userSql += ` ${key} IN ('${newVal}') AND`;
  });

   if (_.endsWith(userSql, ' AND')) userSql = userSql.slice(0, -4);
   return userSql;
}
