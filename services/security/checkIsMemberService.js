const ErrorWrapper = require('../../core/ErrorWrapper')
const errorCodes = require('../../config/errorCodes')

/**
 * @description check is logged in user status
 */
module.exports = currentUser => {
  __typecheck(currentUser, __type.object, true)

  return new Promise((resolve, reject) => {
    if (currentUser.id) return resolve()
    return reject(new ErrorWrapper({ ...errorCodes.NO_ANONYMOUS_ACCESS }))
  })
}
