Package.describe({
    name: 'meteortypescript:typescript-libs',
    summary: 'Common TypeScript definition files for Meteor, including meteor.d.ts and much more.',
    version: '1.1.7',
    git: 'https://github.com/meteor-typescript/meteor-typescript-libs'
});

Package.onUse(function (api, where) {
    api.versionsFrom('1.1.0.2');
    api.addFiles([
        'definitions/all-definitions.d.ts',
        'definitions/meteor.d.ts',
        'definitions/backbone.d.ts',
        'definitions/bootstrap.d.ts',
        'definitions/collectionfs.d.ts',
        'definitions/d3.d.ts',
        'definitions/errors.d.ts',
        'definitions/flash-messages.d.ts',
        'definitions/google-maps-smart-package.d.ts',
        'definitions/google.maps.d.ts',
        'definitions/handlebars.d.ts',
        'definitions/ironrouter.d.ts',
        'definitions/jquery.d.ts',
        'definitions/lib.d.ts',
        'definitions/meteor.d.ts',
        'definitions/node-fibers.d.ts',
        'definitions/node.d.ts',
        'definitions/observatory.d.ts',
        'definitions/paginated-subscription.d.ts',
        'definitions/roles.d.ts',
        'definitions/smart-collections.d.ts',
        'definitions/underscore.d.ts',
        'definitions/underscore.string.d.ts'
    ], ['server']);
});

Package.onTest(function(api) {
    api.use('meteortypescript:typescript-libs', ['server']);
    api.use(['tinytest', 'test-helpers', 'underscore'], ['server']);
    api.addFiles('scripts/typescript-libs-tests.js', ['server']);

    api.addFiles([
        'definitions/all-definitions.d.ts',
        'definitions/meteor.d.ts',
        'definitions/backbone.d.ts',
        'definitions/bootstrap.d.ts',
        'definitions/collectionfs.d.ts',
        'definitions/d3.d.ts',
        'definitions/errors.d.ts',
        'definitions/flash-messages.d.ts',
        'definitions/google-maps-smart-package.d.ts',
        'definitions/google.maps.d.ts',
        'definitions/handlebars.d.ts',
        'definitions/ironrouter.d.ts',
        'definitions/jquery.d.ts',
        'definitions/lib.d.ts',
        'definitions/node-fibers.d.ts',
        'definitions/node.d.ts',
        'definitions/observatory.d.ts',
        'definitions/paginated-subscription.d.ts',
        'definitions/roles.d.ts',
        'definitions/smart-collections.d.ts',
        'definitions/underscore.d.ts',
        'definitions/underscore.string.d.ts',

        'tinytest-definition-tests/meteor-tests.ts',
        'tinytest-definition-tests/backbone-tests.ts',
        'tinytest-definition-tests/bootstrap-tests.ts',
        'tinytest-definition-tests/d3-tests.ts',
        'tinytest-definition-tests/handlebars-tests.ts',
        'tinytest-definition-tests/jquery-tests.ts',
        'tinytest-definition-tests/node-fibers-tests.ts',
        'tinytest-definition-tests/node-tests.ts',
        'tinytest-definition-tests/underscore-tests.ts',
        'tinytest-definition-tests/underscore.string-tests.ts'
    ], ['server']);
});
