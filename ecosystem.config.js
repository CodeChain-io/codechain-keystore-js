module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [

        // First application
        {
            name: 'codechain-keystore',
            script: 'bin/www.ts',
            env: {
                COMMON_VARIABLE: 'true'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ]
};
