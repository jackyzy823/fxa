/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import { assert } from 'chai';
import Account from 'models/account';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import BaseBroker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import Relier from 'models/reliers/relier';
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/post_verify/account_recovery/confirm_password';
import WindowMock from '../../../../mocks/window';
import $ from 'jquery';

describe('views/post_verify/account_recovery/confirm_password', () => {
  let account;
  let broker;
  let metrics;
  let model;
  let notifier;
  let relier;
  let sentryMetrics;
  let user;
  let view;
  let windowMock;
  let recoveryKeyExists = false;

  beforeEach(() => {
    recoveryKeyExists = false;
    windowMock = new WindowMock();
    relier = new Relier({
      window: windowMock,
    });
    broker = new BaseBroker({
      relier,
      window: windowMock,
    });
    account = new Account({
      email: 'a@a.com',
      uid: 'uid',
    });
    model = new Backbone.Model({
      account,
    });
    notifier = _.extend({}, Backbone.Events);
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });
    user = new User();
    view = new View({
      broker,
      metrics,
      model,
      notifier,
      relier,
      user,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    sinon.stub(account, 'checkRecoveryKeyExists').callsFake(() =>
      Promise.resolve({
        exists: recoveryKeyExists,
      })
    );

    return view.render().then(() => $('#container').html(view.$el));
  });

  afterEach(function() {
    metrics.destroy();
    view.remove();
    view.destroy();
  });

  describe('render', () => {
    it('renders the view', () => {
      assert.lengthOf(view.$('#fxa-confirm-password-header'), 1);
      assert.include(view.$('.verification-email-message').text(), 'a@a.com');
      assert.lengthOf(view.$('#submit-btn'), 1);
      assert.lengthOf(view.$('#maybe-later-btn'), 1);
    });

    describe('without an account', () => {
      beforeEach(() => {
        account = new Account({});
        sinon.spy(view, 'navigate');
        return view.render();
      });

      it('redirects to the email first page', () => {
        assert.isTrue(view.navigate.calledWith('/'));
      });
    });

    describe('with a recovery key', () => {
      beforeEach(() => {
        recoveryKeyExists = true;
        sinon.spy(view, 'navigate');
        return view.render();
      });

      it('redirects to verified page', () => {
        assert.isTrue(
          view.navigate.calledWith(
            '/post_verify/account_recovery/verified_recovery_key'
          )
        );
      });
    });
  });

  describe('submit', () => {
    describe('success', () => {
      beforeEach(() => {
        sinon
          .stub(account, 'createRecoveryBundle')
          .callsFake(() => Promise.resolve({}));
        sinon.spy(view, 'navigate');
        return view.submit();
      });

      it('redirects to save recovery key page', () => {
        assert.isTrue(
          view.navigate.calledWith(
            '/post_verify/account_recovery/save_recovery_key',
            {}
          )
        );
      });
    });

    describe('errors', () => {
      let error;

      beforeEach(() => {
        sinon
          .stub(account, 'createRecoveryBundle')
          .callsFake(() => Promise.reject(error));
      });

      describe('with invalid password', () => {
        beforeEach(() => {
          sinon.spy(view, 'showValidationError');
          error = AuthErrors.toError('INCORRECT_PASSWORD');
          return view.submit();
        });

        it('should show validation tooltip', () => {
          assert.isTrue(
            view.showValidationError.calledWith(view.$('#password'), error)
          );
        });
      });

      describe('other errors', () => {
        it('should throw and handle in lower level', () => {
          error = AuthErrors.toError('UNEXPECTED_ERROR');
          return view.submit().then(assert.fail, err => {
            assert.equal(err, error);
          });
        });
      });
    });
  });

  describe('click maybe later', () => {
    describe('success', () => {
      beforeEach(() => {
        sinon.spy(view, 'invokeBrokerMethod');
        return view.clickMaybeLater();
      });

      it('calls correct broker methods', () => {
        assert.isTrue(
          view.invokeBrokerMethod.calledWith('afterCompleteSignIn', account)
        );
      });
    });
  });
});
