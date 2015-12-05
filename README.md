mom - the module manager
============
Dynamic Loading of Javascript based on DOM elements.
Especially usefull for Content Management Systems (CMS):
   - where you don't know which javascript needs to be loaded on which page
   - where you want to configure javascript during rendering
   - where you want to loosely couple modules, because you don't now if the other module is even on the page

For more details, see
- Documentation on the [project's website](http://mom.js.org)
- Online examples
  - [Weather](http://momjs.github.io/mom/examples/weather/)
  - [ToDo](http://momjs.github.io/mom/examples/todo/)

####Status
|Master|Develop|
|------|-------|
|[![Build Status](https://travis-ci.org/momjs/mom.svg?branch=master)](https://travis-ci.org/momjs/mom)|[![Build Status](https://travis-ci.org/momjs/mom.svg?branch=develop)](https://travis-ci.org/momjs/mom)|
|[![Coverage Status](https://coveralls.io/repos/momjs/mom/badge.svg?branch=master)](https://coveralls.io/r/momjs/mom?branch=master)|[![Coverage Status](https://coveralls.io/repos/momjs/mom/badge.svg?branch=develop)](https://coveralls.io/r/momjs/mom?branch=develop)|
|[![Sauce Test Status](https://saucelabs.com/browser-matrix/momjs_master.svg)](https://saucelabs.com/u/momjs_master)|[![Sauce Test Status](https://saucelabs.com/browser-matrix/momjs.svg)](https://saucelabs.com/u/momjs)|

[![Dev Dependencies](https://david-dm.org/momjs/mom/dev-status.svg)](https://david-dm.org/momjs/mom#info=devDependencies)

To do future releases
-------------
- [ ] add plugin concept for spezialized modules and parts
- [ ] configurable async loading of modules and part
- [ ] debug module access with console or dev tools plugin
