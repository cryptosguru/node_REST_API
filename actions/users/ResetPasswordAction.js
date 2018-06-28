const Joi = require('joi')

const BaseAction = require('../BaseAction')
// const UserDAO = require('../../dao/UserDAO')
// const authModule = require('../../services/auth')
// const registry = require('../../registry')

class ResetPasswordAction extends BaseAction {
  static get accessTag () {
    return 'users:reset-password'
  }

  static get validationRules () {
    return {
      ...this.baseValidationRules,
      body: Joi.object().keys({
        resetPasswordToken: Joi.string().required()
      })
    }
  }

  static run (req, res, next) {
    // let currentUser = registry.getCurrentUser()

    this.init(req, this.validationRules, this.accessTag)
      .then(() => this.checkAccessByTag(this.accessTag))
      .then(data => res.json({ data: 'ResetPasswordAction', success: true }))
      .catch(error => next(error))
  }
}

module.exports = ResetPasswordAction
