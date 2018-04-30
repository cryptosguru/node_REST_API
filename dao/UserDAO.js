const BaseDAO = require('./BaseDAO')
const { ref, raw } = require('objection')

class UserDAO extends BaseDAO {
  static get tableName () {
    return 'users'
  }

  static get jsonAttributes () {
    return ['refreshTokensMap']
  }

  /**
   * ------------------------------
   * @HOOKS
   * ------------------------------
   */
  $formatJson (json) {
    json = super.$formatJson(json)

    delete json.passwordHash
    // delete json.refreshTokensMap
    delete json.tokenReset
    delete json.avatar

    return json
  }

  /**
   * ------------------------------
   * @METHODS
   * ------------------------------
   */

  static GetByEmail (email) {
    __typecheck(email, 'String', true)

    return this.query().where({ email }).first()
      .then(data => {
        if (!data) throw this.errorEmptyResponse()
        return data
      }).catch(error => { throw error })
  }

  static GetRefreshToken (userId, refreshTokenTimestamp) {
    __typecheck(userId, 'Number', true)
    __typecheck(refreshTokenTimestamp, 'String', true)

    return this.query()
      .findById(userId)
      .select(ref(`refreshTokensMap:${refreshTokenTimestamp}`).castJson().as('refreshToken'))
      .then(data => {
        if (!data.refreshToken) throw this.errorEmptyResponse()
        return data.refreshToken
      }).catch(error => { throw error })
  }

  static RemoveRefreshToken (userId, refreshTokenTimestamp) {
    __typecheck(userId, 'Number', true)
    __typecheck(refreshTokenTimestamp, 'String', true)

    return this.query()
      .patch({ refreshTokensMap: raw('?? - ?', 'refreshTokensMap', refreshTokenTimestamp) })
  }

  static AddRefreshTokenProcess (userEntity, data) {
    __typecheck(userEntity, 'Object', true)
    __typecheck(data, 'Object', true)
    __typecheck(data.timestamp, 'String', true)
    __typecheck(data.refreshToken, 'String', true)

    if (this._isValidRefreshTokensCount(userEntity)) {
      return this._AddRefreshToken(userEntity.id, data)
    }
    return this._ClearRefreshTokensList(userEntity.id)
        .then(() => this._AddRefreshToken(userEntity.id, data))
        .catch(error => { throw error })
  }

  /**
   * add new prop to 'refreshTokensMap' jsonb field
   * prop name === token creation timestamp
   * store to this prop REFRESH TOKEN
   */
  static _AddRefreshToken (userId, data) {
    __typecheck(userId, 'Number', true)
    __typecheck(data, 'Object', true)
    __typecheck(data.timestamp, 'String', true)
    __typecheck(data.refreshToken, 'String', true)

    return this.query()
      .findById(userId)
      .patch({
        [`refreshTokensMap:${data.timestamp}`]: data.refreshToken,
        lastActivityAt: new Date().toISOString() // on each refresh >> update lastActivityAt field
      })
  }

  static _GetRefreshTokensCount (userId) { // test TODO remove it
    __typecheck(userId, 'Number', true)

    return this.query()
      .findById(userId)
      .select('refreshTokensMap')
      .then(data => {
        if (!data) throw this.errorEmptyResponse()
        return Object.keys(data.refreshTokensMap).length
      }).catch(error => { throw error })
  }

  static _ClearRefreshTokensList (userId) {
    __typecheck(userId, 'Number', true)

    return this.query().findById(userId).patch({ refreshTokensMap: {} })
  }

  /**
   * user can have max 5 sessions(refresh tokens)
   */
  static _isValidRefreshTokensCount (userEntity) {
    __typecheck(userEntity, 'Object', true)

    let count = Object.keys(userEntity.refreshTokensMap).length
    return count <= 5
  }
}

module.exports = UserDAO
