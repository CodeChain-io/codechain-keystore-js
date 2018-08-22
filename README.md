Codechain keystore
===================

Codechain keystore is a private key management library. It saves CodeChain's asset transfer address safely in a disk. If you want to manage CodeChain keys using nodejs, you should use this.

Example
-----------

```js
var CCKey = require('codechain-keystore');

async function example() {
  const cckey = await CCKey.create();
  const savedKeys = await cckey.getKeys();
  console.dir(savedKeys);
  await cckey.createKey({ passphrase: "my password" });
  const savedKeys_ = await cckey.getKeys();
  console.dir(savedKeys_);

  await await cckey.close();
};
example();

```

How your private key is saved
-------------------

We use SQLite to save an encrypted private key. You can find the SQLite file in `./keystore.db`
