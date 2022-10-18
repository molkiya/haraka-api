'use strict';

const outbound = require('./outbound');
const MailComposer = require('../../node_modules/nodemailer/lib/mail-composer');
const axios = require("axios");

exports.register = function() {
  const plugin = this;
  plugin.code = '+';
};

exports.hook_capabilities = function(next, con) {
  const plugin = this;
  con.capabilities.push(plugin.code);
  next();
};

exports.hook_unrecognized_command = async function(next, con, argv) {
  const plugin = this;
  if (argv.shift() !== plugin.code)
    return next();

  const obj = Buffer.from(argv[0], 'base64').toString();
  const content_obj = JSON.parse(obj);
  const mail = new MailComposer({...content_obj.mail});

  mail.compile().build().then(result => outbound.send_email(
      '*',
      content_obj.mail.to[0].address,
      result.toString(),
      (c, m) => con.respond(c === OK ? 250 : 554, m),
      {
        notes: {
          skip_plugins: []
        },
      },
  ));
  next(OK);
};

exports.hook_deferred = async function (next, ...params) {
  const plugin = this;

  this.loginfo('hook_deferred');
  const res = await axios.post(
      'http://consumer:3001/api/mail',
      { data: JSON.stringify(params[0].todo) },
      {
        headers: {
          'Content-Type': 'application/json'
        },
      }
  )

  if (!res || res !== "OK") {
    this.loginfo('bad request to consumer: ', ...params)
  }

  next();
};

exports.hook_bounce = async function (next, ...params) {
  const plugin = this;

  this.loginfo('hook_bounce');
  const res = await axios.post(
      'http://consumer:3001/api/mail',
      { data: JSON.stringify(params[0].todo) },
      {
        headers: {
          'Content-Type': 'application/json'
        },
      }
  )

  if (!res || res !== "OK") {
    this.loginfo('bad request to consumer: ', ...params)
  }

  next();
};

exports.hook_delivered = async function (next, ...params) {
  const plugin = this;

  this.loginfo('hook_delivered');
  const res = await axios.post(
      'http://consumer:3001/api/mail',
      { data: JSON.stringify(params[0].todo) },
      {
        headers: {
          'Content-Type': 'application/json'
        },
      }
  )

  if (!res || res !== "OK") {
    this.loginfo('bad request to consumer: ', ...params)
  }

  next();
};
