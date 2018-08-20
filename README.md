Codechain keystore
===================

Codechain keystore is a private key management server. It saves CodeChain's asset transfer address safely in a disk. You should use this keystore to save your private key safely in CodeChain-SDK.

Install
--------

Run `yarn install`
Run `yarn pm2 install typescript`
Run `yarn pm2 install pm2-logrotate`

Run
--------

Run `yarn pm2 start ecosystem.config.js`

How your private key is saved
-------------------

We use SQLite to save an encrypted private key. You can find the SQLite file in `./keystore.db`
