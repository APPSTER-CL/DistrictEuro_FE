/*

    S3 configuration info

LOCAL: http://localhost:8000/
TEST: https://
PRODUCTION: https://

 */

// Set to debug for normal development.
var environments = {
  dev: 1,
  test: 2,
  demo: 3,
  prod: 4
};


/*==================================================================================
 *==================================================================================
 * SET THESE VARIABLES TO THE ELASTIC BEANSTALK UPLOAD VERSION
 * AND THE DESIRED ENVIRONMENT.
 */
var includeversion = 1;
var currentEnvironment = environments["{ENV}"];
//==================================================================================
//==================================================================================


// Local development (default when currentEnvironment is not production or staging).
var baseApiUrl = "http://localhost:8080";
var baseSiteUrl = "http://localhost:5555/";

if (currentEnvironment == environments.test) {
  // Staging
  baseApiUrl = "https://apitest.oumimen.com";
  baseSiteUrl = "https://test.oumimen.com/";
} else if (currentEnvironment == environments.demo) {
  // Production
  baseApiUrl = "https://apidemo.oumimen.com";
  baseSiteUrl = "https://demo.oumimen.com/";
} else if (currentEnvironment == environments.prod) {
  // Production
  baseApiUrl = "https://api.oumimen.com";
  baseSiteUrl = "https://www.oumimen.com/";
}

window.configuration = {
  htmlIncludeVersion: includeversion,

  debug: {
    isDebug: (currentEnvironment != environments.prod),
    isDevEnvironment: (currentEnvironment == environments.dev),
    alertErrors: true
  },

  h4eUrl: baseSiteUrl,

  webApi: {
    persons: {
      get_profile: baseApiUrl + "/person/get_profile/",
      save_profile: baseApiUrl + "/person/save_profile/",
      delete_profile: baseApiUrl + "/person/delete_profile/",
      get_personal_information: baseApiUrl + "/person/get_personal_information/",
      upload_profile_image: baseApiUrl + "/person/upload_profile_image/",
      upload_photo: baseApiUrl + "/person/upload_photo/"
    },
    appointments: {
      get_appointments: baseApiUrl + "/appointments/"
    },
    orders: {
      get_orders: baseApiUrl + "/api/vendor/order/",
      get_orders_unconfirmed: baseApiUrl + "/api/vendor/order/unconfirmed/",
      get_orders_history: baseApiUrl + "/api/vendor/order/history/",
      update_order_status: baseApiUrl + "/api/vendor/order/",
      get_order_status: baseApiUrl + "/api/shipping-status/"
    },
    products: {
      get_products: baseApiUrl + "/api/vendor/product/",
      get_incomplete_products: baseApiUrl + "/api/vendor/incomplete-product/",
      get_inventory: baseApiUrl + "/api/vendor/inventory/",
      get_unapproved_inventory: baseApiUrl + "/api/vendor/inventory/unapproved/",
      bulk_upload: baseApiUrl + "/api/vendor/bulk-upload/",
      image_upload: baseApiUrl + "/api/image/product/",
      incomplete_image_upload: baseApiUrl + "/api/image/incompleteproduct/"
    },
    categories: {
      get_categories: baseApiUrl + "/api/category/"
    },
    attributes: {
      get_attributes: baseApiUrl + "/api/vendor/product-attribute/"
    },
    samples: {
      sample_dispatch: baseApiUrl + "/api/vendor/sample-dispatch/",
      sample: baseApiUrl + "/api/vendor/sample/"
    },
    analytics: {
      overview: baseApiUrl + "/api/vendor/overview/"
    },
    accounts: {
      login: baseApiUrl + "/account/login/",
      logout: baseApiUrl + "/account/logout/",
      register: baseApiUrl + "/account/register/",
      verify: baseApiUrl + "/account/verify_account_token/",
      refresh_token: baseApiUrl + "/account/refresh_token/",
      change_password: baseApiUrl + "/account/change_password/",
      forgot_password: baseApiUrl + "/account/forgot_password/",
      verify_forgot_pass_token: baseApiUrl + "/account/verify_forgot_pass_token/",
      reset_password: baseApiUrl + "/account/reset_password/",
      verify_email: baseApiUrl + "/account/verify_email/"
    },
    employee: {
      sample_dispatch: baseApiUrl + "/api/employee/sample-dispatch/",
      sample: baseApiUrl + "/api/employee/sample/",
      sample_showroom: baseApiUrl + "/api/employee/sample/on-showroom/",
      sample_warehouse: baseApiUrl + "/api/employee/sample/on-warehouse/",
      showroom: baseApiUrl + "/api/employee/showroom/"
    },
    others: {
      warehouse: baseApiUrl + "/api/warehouse/",
      currency: baseApiUrl + "/api/currency/",
      language: baseApiUrl + "/api/language/"
    },
    landing: {
      sign_up: baseApiUrl + "/api/sign-up-request/",
      join_us: baseApiUrl + "/api/join-request/",
      join_us_image: baseApiUrl + "/api/image/join-us/"
    },
    fileUpload: baseApiUrl + "/upload/",
    parseImage: baseApiUrl + "/parseImage/",
    cropImageUrl: baseApiUrl + "/cropImageUrl/"
  },
  storage: {
    userData: 'userData',
    token: 'token',
    token_will_expire: 'token_will_expire',
    token_valid_from: 'token_valid_from',
    user: 'user',
    language: 'language'
  },
  profileImages: {
    coverAspectRatio: 3,
    coverSize: 900, //Pixels
    profileAspectRatio: 1,
    profileSize: 300 //Pixels
  },
  credentialrules: {
    emailMinLen: 6,

    // http://regexlib.com/Search.aspx?k=password&AspxAutoDetectCookieSupport=1
    // 1) Password between 6 and 20 characters; must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character, but cannot contain whitespace.
    //var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,20}$/;

    // 2) 4 chars, no special chars - just lower/upper/number
    //var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{4,20}$/;

    //pwdRegex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{4,20}$/,
    pwdMinLen: 4, // <== If this changes, change it   ^  above in the regex!!!

    // This is just for test/dev: just 4 chars all lowercase is OK
    pwdRegex: /^(?=.*[a-z])(?!.*\s).{4,20}$/ // Dev-only
  }
};
