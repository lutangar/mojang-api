Package.describe({
  name: 'lutangar:mojang-api',
  version: '0.0.4',
  summary: 'Integrates the Mojang authentication API server-side',
  git: 'https://github.com/lutangar/mojang-api.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');
  api.use(['http', 'check'], 'server');
  api.export('Mojang', 'server');
  api.addFiles('mojang-api.js', 'server');
});

Package.onTest(function(api) {
  api.use(['lutangar:mojang-api', 'tinytest'], ['server']);
  api.addFiles('mojang-api-tests.js', ['server']);
});
