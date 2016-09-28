"use strict";

const SandGrain = require('sand-grain');
const _ = require('lodash');

class Mailgun extends SandGrain {
  constructor() {
    super();

    this.defaultConfig = {};
    this.version = require('../package').version;
  }

  init(config, done) {
    super.init(config);

    this.client = require('mailgun-js')({
      apiKey: this.config.apiKey,
      domain: this.config.domain
    });

    done();
  }

  /**
   * @param {String|Array} to
   * @param {String} [subject]
   * @param {String} [body]
   * @param {Object} [options]
   *
   * @return {Promise}
   *
   * @see https://github.com/1lobby/mailgun-js/blob/master/README.md
   * @see https://documentation.mailgun.com/api-sending.html#sending
   */
  sendEmail(to, subject, body, options) {
    options = options || {};

    let defaults = {
      from: `${options.fromName || this.config.fromName} <${options.fromEmail || this.config.fromEmail}>`
    };

    if (_.isPlainObject(to) && arguments.length == 1) {
      // only 1 argument passed, use 'to' as options
      options = to;
    } else {
      options = options || {};
      options.to = !_.isArray(to) ? to : to.join(', '); // comma-separate if array
      options.subject = subject;
      options.html = body;
    }

    _.defaults(options, defaults);

    return new Promise((resolve, reject) => {
      this.client.messages().send(options, (error, body) => {
        if (error) {
          sand.error('Mailgun send failed', error);
          return reject(error);
        }

        resolve(body);
      });
    });
  }
}

module.exports = Mailgun;