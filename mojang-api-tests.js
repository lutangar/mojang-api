Tinytest.add('mojang-api', function (test) {
    test.equal(
        Mojang.API.authenticate('test', 'test', { name: 'curvytron', version: 1}),
        {
            "error": "ForbiddenOperationException",
            "errorMessage": "Invalid credentials. Invalid username or password."
        },
        'Invalid credentials error expected'
    );
});
