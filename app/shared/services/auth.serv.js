angular.module('DistrictEuro').service('AuthService', function(configuration) {

  var self = this;

  /*
   * EMAIL
   */
  //--------------------------------------------------------------------------
  //--------------------------------------------------------------------------
  self.regEmailIsValid = function(email) {
    var minLen = configuration.credentialrules.emailMinLen;
    var emailDefined = (email && (email.length >= minLen));
    var emailValid1 = emailDefined; // Here for when we add the rest of the email rules (ditto below) - see ticket 15

    var emailIsValid2 = self.isEmailValid(email);
    var emailIsValid3 = !self.hasWhiteSpace(email);

    var emailValid = emailValid1 && emailIsValid2 && emailIsValid3;

    return emailValid;
  };

  //--------------------------------------------------------------------------
  //--------------------------------------------------------------------------
  self.hasWhiteSpace = function(s) {
    return (/\s/g).test(s);
  };

  //--------------------------------------------------------------------------
  //--------------------------------------------------------------------------
  self.isEmailValid = function(email) {
    if (!email || (email.length > 254)) {
      return false;
    }
    ////var regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    ////var regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/;	// Doesn't work for .uy or other 2-letter
    //var regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    //var isValid = regex.test(email);

    //////// http://stackoverflow.com/a/46181/11236
    //////var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    //////var isValid = re.test(email);

    //return isValid;

    // From http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
    var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
    var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
    var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
    var sQuotedPair = '\\x5c[\\x00-\\x7f]';
    var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
    var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
    var sDomain_ref = sAtom;
    var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
    var sWord = '(' + sAtom + '|' + sQuotedString + ')';
    var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
    var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
    var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
    var sValidEmail = '^' + sAddrSpec + '$'; // as whole string
    var reValidEmail = new RegExp(sValidEmail);
    if (reValidEmail.test(email)) {
      return true;
    } else {
      return false;
    }
  };


  /*
   * PASSWORD
   */
  //--------------------------------------------------------------------------
  //--------------------------------------------------------------------------
  self.regPasswordIsValid = function(password) {
    // NOTE
    //var minChars = 4;	// <== If this changes, change it in the regex below!!!
    //
    var minChars = configuration.credentialrules.pwdMinLen;

    var pwdDefined = (password && (password.length >= minChars));

    // http://regexlib.com/Search.aspx?k=password&AspxAutoDetectCookieSupport=1
    // 1) Password between 6 and 20 characters; must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character, but cannot contain whitespace.
    //var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,20}$/;

    // 2) 4 chars, no special chars - just lower/upper/number
    //var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{4,20}$/;

    var regex = configuration.credentialrules.pwdRegex;

    var pwdMatchesRules = regex.test(password);

    var pwdValid = pwdDefined && pwdMatchesRules;

    return pwdValid;
  };
});
