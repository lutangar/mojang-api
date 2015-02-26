Tinytest.add('mojang-api', function (test) {
    test.equal(
        Mojang.API.authenticate('test', 'test', { name: 'curvytron', version: 1}),
        {
            "error": "ForbiddenOperationException",
            "errorMessage": "Invalid credentials. Invalid username or password."
        },
        'Invalid credentials error expected'
    );

    test.equal(
        Mojang.API.getUUID('minecraft', 'lutangar', 1424954089),
        {
            "id": "2d4a2b4d898749c388fceb151d624d04",
            "name": "lutangar",
            "legacy": true
        },
        'Get a player uuid'
    );
});
