Mojang = {};
Mojang.API = {};
Mojang.API.BaseURL = 'https://api.mojang.com/';
Mojang.API.Authentication = {};
Mojang.API.Authentication.BaseURL = 'https://authserver.mojang.com/';

/**
 * Authenticates a user using his password.
 *
 * @param {String} username
 * @param {String} password
 * @param {Object} agent {"name": "minecraft", "version": 1}
 * @returns {Object}
 * {
 *   "accessToken": "random access token", // hexadecimal
 *   "clientToken": "client identifier",   // identical to the one received
 *   "availableProfiles": [                // only present if the agent field was received
 *     {
 *       "id": "profile identifier",       // hexadecimal
 *       "name": "player name",
 *       "legacy": true or false           // In practice, this field only appears in the response if true.  Default to false.
 *     }
 *   ],
 *   "selectedProfile": {                  // only present if the agent field was received
 *     "id": "profile identifier",
 *     "name": "player name",
 *     "legacy": true                      // or false
 *   }
 * }
 */
Mojang.API.authenticate = function(username, password, agent) {
    agent = agent || {};

    try {
        var response = Meteor.http.post(Mojang.API.Authentication.BaseURL + 'authenticate', {
            headers: {
                "Accept": 'application/json'
            }, data: {
                "agent": agent,
                "username": username,
                "password": password,
                "clientToken": Meteor.uuid()
            }
        });
        response = JSON.parse(response.content);
    } catch (e) {
        response = buildResponseFromError(e);
    } finally {
        return response;
    }
};

/**
 * Refreshes a valid accessToken. It can be uses to keep a user logged in between gaming sessions
 * and is preferred over storing the user's password in a file
 *
 * @param {String} accessToken
 * @param {String} clientToken
 * @param {Object} profile {"id": "profile identifier", "name": "player name"}
 * @returns {Object}
 */
Mojang.API.refresh = function(accessToken, clientToken, profile)
{
    profile = profile || {};

    try {
        var response = Meteor.http.post(Mojang.API.Authentication.BaseURL + 'refresh', {
            headers: {
                Accept: 'application/json'
            }, data: {
                accessToken: accessToken,
                clientToken: clientToken,
                selectedProfile: profile
            }
        });
        response = JSON.parse(response.content);
    } catch (e) {
        response = buildResponseFromError(e);
    } finally {
        return response;
    }
};

/**
 * Checks if an accessToken is a valid session token with a currently-active session.
 * Note: this method will not respond successfully to all currently-logged-in sessions, just the most recently-logged-in for each user.
 *
 * It is intended to be used by servers to validate that a user should be connecting
 * (and reject users who have logged in elsewhere since starting Minecraft),
 * NOT to auth that a particular session token is valid for authentication purposes.
 *
 * To authenticate a user by session token, use the refresh verb and catch resulting errors.
 *
 * @param {String} accessToken
 * @returns {Object}
 */
Mojang.API.validate = function(accessToken)
{
    try {
        var response = Meteor.http.post(APIBaseURL + 'refresh', {
            headers: {
                Accept: 'application/json'
            }, data: {
                accessToken: accessToken
            }
        });
        response = JSON.parse(response.content);
    } catch (e) {
        response = buildResponseFromError(e);
    } finally {
        return response;
    }
};

/**
 * Invalidates accessTokens using an account's username and password
 *
 * @param {String} username
 * @param {String} password
 * @returns {Object}
 */
Mojang.API.signOut = function(username, password)
{
    try {
        var response = Meteor.http.post(APIBaseURL + 'refresh', {
            headers: {
                Accept: 'application/json'
            }, data: {
                username: username,
                password: password
            }
        });
        response = JSON.parse(response.content);
    } catch (e) {
        response = buildResponseFromError(e);
    } finally {
        return response;
    }
};

/**
 * Invalidates accessTokens using a client/access token pair
 *
 * @param {String} accessToken
 * @param {String} clientToken
 * @returns {Object}
 */
Mojang.API.invalidate = function(accessToken, clientToken)
{
    try {
        var response = Meteor.http.post(Mojang.API.Authentication.BaseURL + 'refresh', {
            headers: {
                Accept: 'application/json'
            }, data: {
                accessToken: accessToken,
                clientToken: clientToken
            }
        });
        response = JSON.parse(response.content);
    } catch (e) {
        response = buildResponseFromError(e);
    } finally {
        return response;
    }
};

/**
 * Get UUID of a user for the given agent at the given time
 *
 * @param {String} agent the name of the game
 * @param {String} username
 * @param {Integer} at a timestamp default to now
 * @returns {Object}
 */
Mojang.API.getUUID = function(agent, username, at)
{
    at = at || Date.now();

    check(agent, Match.OneOf('minecraft'));
    check(username, Match.Where(function (username) {
        check(username, String);
        return username.length >= 6;
    }));
    check(at, Match.Where(function (timestamp) {
        return (new Date(timestamp)).getTime() > 0;
    }));

    try {
        var response = Meteor.http.get(Mojang.API.BaseURL + 'users/profiles/' + agent + '/' + username + '?at' + at, {
            headers: {
                Accept: 'application/json'
            }
        });
        response = JSON.parse(response.content);
    } catch (e) {
        response = buildResponseFromError(e);
    } finally {
        return response;
    }
};

/**
 * Build a uniform error response base on Mojang's authentication server response
 *
 * @param {Error} e
 * @returns {Object} {
 *   "error": "Short description of the error",
 *   "errorMessage": "Longer description which can be shown to the user"
 * }
 */
var buildResponseFromError = function (e) {
    var response;
    if (e.response) {
        if (e.response.data) {
            response = e.response.data;
        } else {
            response = e.response;
        }
    } else {
        response = {
            error: 'NotFound',
            errorMessage: "Couldn't resolve hostname. Are you offline?"
        };
    }

    return response;
};
