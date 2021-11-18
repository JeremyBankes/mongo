# mongo
Utility for easier interactions with MongoDB in Node applications.

## Getting Started
 - Add as submodule to your project
   - ```git submodule add https://github.com/JeremyBankes/core.git modules/mongo```
 - Ensure that the MonogDB Node.js driver is installed
   - ```npm install --save mongodb```
 - Start using the library!

```js
const mongo = require('./modules/mongo.js');

async function testDatabase() {
    await mongo.start('mongodb+srv://server.mongodb.net/database');
    const status = await mongo.open().admin().serverStatus();
    console.info(status);
}
```
