Package.describe({
    name: 'meteortypescript:typescript-libs',
    summary: 'The most common TypeScript definition files for Meteor, including meteor.d.ts and third party library definitions.',
    version: '1.0.0',
    git: 'https://github.com/meteor-typescript/meteor-typescript-libs'
});

Npm.depends({
    'exec': '0.1.3'
});

//Package.onUse(function (api, where) {
//    api.versionsFrom('1.0.2.1');
//    api.addFiles([
//        'definitions/all-definitions.d.ts',
//        'definitions/backbone.d.ts',
//        'definitions/bootstrap.d.ts',
//        'definitions/collectionfs.d.ts',
//        'definitions/d3.d.ts',
//        'definitions/errors.d.ts',
//        'definitions/flash-messages.d.ts',
//        'definitions/google-maps-smart-package.d.ts',
//        'definitions/google.maps.d.ts',
//        'definitions/handlebars.d.ts',
//        'definitions/ironrouter.d.ts',
//        'definitions/jquery.d.ts',
//        'definitions/lib.d.ts',
//        'definitions/meteor.d.ts',
//        'definitions/node-fibers.d.ts',
//        'definitions/node.d.ts',
//        'definitions/observatory.d.ts',
//        'definitions/paginated-subscription.d.ts',
//        'definitions/roles.d.ts',
//        'definitions/smart-collections.d.ts',
//        'definitions/underscore.d.ts',
//        'definitions/underscore.string.d.ts'
//    ]);
//});

Package.onTest(function(api) {
    api.use('meteortypescript:typescript-libs', ['server']);
    api.use(['tinytest', 'test-helpers', 'underscore'], ['server']);
    api.addFiles('typescript-libs-tests.js', ['server']);

    api.addFiles([
        'definitions/all-definitions.d.ts',
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
        'definitions/underscore.string.d.ts',

        'definition-tests/backbone-tests.ts',
        'definition-tests/bootstrap-tests.ts',
        'definition-tests/d3-tests.ts',
        'definition-tests/handlebars-tests.ts',
        'definition-tests/jquery-tests.ts',
        'definition-tests/node-fibers-tests.ts',
        'definition-tests/node-tests.ts',
        'definition-tests/underscore-tests.ts',
        'definition-tests/underscore.string-tests.ts',
        'definition-tests/meteor-tests.ts'
    ]);
});