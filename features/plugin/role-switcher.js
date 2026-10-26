/** Legacy quick-login is disabled; retain the registration for loader compatibility.
 * Native account/role selection is unchanged. No saved credentials are read or written.
 */
(function (global) {
  "use strict";
  global.WSMudPlugin.registerFeature("role-switcher", function () {});
})(window);
