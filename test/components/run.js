import '/node_modules/mocha/mocha.js';

import './browser-test.js';
// import './vinylRecord-test.js';

mocha.checkLeaks();
mocha.run();
