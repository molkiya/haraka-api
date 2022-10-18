const express = require('express')
const bodyParser = require('body-parser')
const {Socket} = require('node:net')
const {body, validationResult} = require('express-validator')
const {readFile} = require('fs/promises')
const {randomUUID} = require('crypto')
const {spawn} = require("node:child_process")
const {openSync} = require("node:fs")
const path = require('path')
const axios = require("axios");

require('dotenv/config')

const hpid = (cp => cp.unref() || cp.pid)(spawn('./node_modules/Haraka/bin/haraka', ['-c', './hrk'], {
    detached: true,
    stdio: ['ignore', openSync('/tmp/out.log', 'a'), openSync('/tmp/err.log', 'a')]
}));

console.log("hpid:   ", hpid)

setTimeout(() => {
    const app = express();
    app.use(bodyParser.json());
    app.post(
        '/api/hrk',
        [
            body('to').notEmpty().normalizeEmail(),
            body('subject').notEmpty().isString(),
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log({errors: errors.array(), date: Date.now().toString()});
                return res.status(400).end();
            }
            try {
                const client = new Socket().connect(25, '127.0.0.1');
                client.write(`+ ${Buffer.from(JSON.stringify({
                    uuid: randomUUID(),
                    mail: {
                        from: {address: '*', name: 'HARAKA'},
                        replyTo: {address: `${req.body.to}`, name: 'ESP'},
                        to: [{address: req.body.to}],
                        subject: req.body.subject,
                        html: `${await readFile(path.resolve(__dirname, 'mail/index.html'), 'utf-8')}`,
                    },
                })).toString('base64')} \n`, (err) => {
                    if (err) console.log(err);
                    client.end();
                });

                return res.status(202).end();
            } catch (e) {
                console.log(e, new Date().toISOString());
                return res.status(500).end();
            }
        },
    )

    const server = app.listen(3000, () => {
        console.log(`[HARAKA-API] Server is listening on port ${3000}`);
    })
    process.on('SIGTERM', () => {
        process.kill(hpid, 'SIGTERM')
        server.close()
    }).on('SIGINT', () => {
        process.kill(process.pid, 'SIGTERM')
    });
}, 5000)