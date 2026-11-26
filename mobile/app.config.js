// app.json holds the app's config; this adds what only some builds carry.
//
// App Attest, App Check's proof on iOS, needs its entitlement, which only a
// paid Apple Developer Program team can sign; a personal team refuses the whole
// build. A development build doesn't use it (it has App Check's debug
// provider), so the entitlement is added only for a release build, by setting
// APP_ATTEST=1 when building one (or in an EAS build profile's env)
module.exports = ({config}) => process.env.APP_ATTEST === "1"
  ? {...config, ios: {...config.ios, entitlements: {...config.ios?.entitlements, "com.apple.developer.devicecheck.appattest-environment": "production"}}}
  : config;
