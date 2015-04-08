jasmine.getEnv().addReporter(new jasmine.JSReporter2());

(function () {
   var oldFunc = window.jasmine.getJSReport;
   window.jasmine.getJSReport = function () {
      var results = oldFunc();
      if (results) {
         return {
            durationSec: results.durationSec,
            suites: removePassingTests(results.suites),
            passed: results.passed
         };
      } else {
         return null;
      }
   };

   function removePassingTests(suites) {
      return $.grep($.map(suites, mapSuite), grepFailed);
   }

   function mapSuite(suite) {
      return $.extend({}, suite, {
         specs: $.grep(suite.specs, grepFailed),
         suites: removePassingTests(suite.suites)
      });
   }

   function grepFailed(item) {
      return !item.passed;
   }
})();