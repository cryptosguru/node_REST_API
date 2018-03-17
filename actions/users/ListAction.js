const Joi = require('joi')
const BaseAction = require('../BaseAction')
const User = require('../../models/User')

/**
 * @description return users list
 */
class ListAction extends BaseAction {
  static get permissions () {
    return {
      anonymous: false,
      admin: true,
      editor: true
    }
  }

  static get validationRules () {
    return {
      ...this.baseValidationRules,
      query: Joi.object().keys({
        q: Joi.string().min(2).max(50)
      })
    }
  }

  static run (req, res, next) {
    global.typecheck(arguments, 'default')
    req.meta.user.role = 'editor' // temp mock data

    this.checkAccess(req.meta.user, this.permissions)
      .then(() => this.validate(req, this.validationRules))
      .then(() => User.GETList())
      .then(data => res.json({ data, success: true }))
      .catch(error => next(error))
  }
}

module.exports = ListAction
