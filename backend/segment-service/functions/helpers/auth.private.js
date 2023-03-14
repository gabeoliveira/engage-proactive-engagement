const TokenValidator = require('twilio-flex-token-validator').validator
const OktaJwtVerifier = require('@okta/jwt-verifier')

class AuthHelper {
  constructor(logger) {
    this.logger = logger
  }
  async validate(context, event) {
    //If user doesn't have auth setup, skip
    if (!context.VALIDATE_AUTH || context.VALIDATE_AUTH === 'false') {
      return true
    }
    if (event.Token) {
      try {
        //check flex
        let flexResponse = await this._validateFlex(
          event.Token,
          context.ACCOUNT_SID,
          context.AUTH_TOKEN
        )
        this.logger.debug(
          `flex auth response ${JSON.stringify(flexResponse, null, 2)}`
        )
        if (flexResponse && flexResponse.valid) {
          return this._normalizeFlexUser(flexResponse)
        }
      } catch (err) {
        this.logger.debug('error with flex auth ' + err)
      }
      if (context.OKTA_ISSUER && context.OKTA_ISSUER !== '') {
        //check okta
        let oktaResponse = await this._validateOkta(
          event.Token,
          context.OKTA_ISSUER
        )
        this.logger.debug(
          `okta response: ${JSON.stringify(oktaResponse, null, 2)}`
        )
        if (oktaResponse && oktaResponse.claims) {
          return this._normalizeOktaUser(oktaResponse)
        }
      }
    }
    return false
  }

  _validateFlex(token, accountSid, authToken) {
    return TokenValidator(token, accountSid, authToken)
  }

  _normalizeFlexUser(flexResult) {
    return {
      email: flexResult.identity + '+flex@twilio.com',
    }
  }

  async _validateOkta(token, issuer) {
    const oktaJwtVerifier = new OktaJwtVerifier({
      issuer, // issuer required
    })

    try {
      let jwt = await oktaJwtVerifier.verifyAccessToken(token, [
        'api://default',
      ])

      if (jwt.name === 'JwtParseError' || !jwt.claims) throw jwt.name
      // the token is valid
      this.logger.debug(`full okta user: ${JSON.stringify(jwt, null, 2)}`)
      return jwt
    } catch (err) {
      // a validation failed, inspect the error
      this.logger.warn(err)
      return false
    }
  }

  _normalizeOktaUser(oktaResult) {
    return {
      email: oktaResult.claims.sub,
    }
  }
}

/** @module crmHelper */
module.exports = {
  AuthHelper,
}
