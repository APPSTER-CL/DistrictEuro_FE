angular.module( 'DistrictEuro.my_inventory', [
  'DistrictEuro.constants',
  'ui.router',
  'angularFileUpload'
])

.config(function config( $stateProvider, USER_ROLES ) {
  $stateProvider.state( 'my_inventory', {
    url: '/inventory',
    views: {
      "base": {
        controller: 'MyInventoryCtrl',
        templateUrl: 'inventory/views/my_inventory.tpl.html'
      }
    },
    parent: 'base',
    data: {
      pageTitle: 'My inventory',
      authorizedRoles: [USER_ROLES.vendor],
      tallToolbar: true
    }
  }).state( 'upload_inventory', {
    url: '/upload',
    controller: 'UploadInventoryCtrl',
    templateUrl: 'inventory/views/upload_inventory.tpl.html',
    parent: 'my_inventory',
    data: {
      pageTitle: 'Upload inventory',
      authorizedRoles: [USER_ROLES.vendor],
      tallToolbar: true
    }
  })
  .state('my_inventory.edit', {
    url: '/{productId:int}',
    controller: 'EditProductCtrl',
    templateUrl: 'inventory/views/edit_product.tpl.html',
    params: {
        incomplete_product: null
    },
    data: {
      pageTitle: 'Edit Product',
      authorizedRoles: [USER_ROLES.vendor],
      tallToolbar: false
    },
    resolve: {
      product: function(ProductsFactory, $stateParams) {
        return ProductsFactory.getProduct($stateParams.productId);
      }
    }
  })
  .state('my_inventory.incomplete_edit', {
    url: '/incomplete/',
    controller: 'EditProductCtrl',
    templateUrl: 'inventory/views/edit_product.tpl.html',
    params: {
        incomplete_product: null
    },
    data: {
      pageTitle: 'Edit Product',
      authorizedRoles: [USER_ROLES.vendor],
      tallToolbar: false
    },
    resolve: {
      product: function() {return null;}
    }
  });
})

.controller( 'MyInventoryCtrl', [ '$scope','$state', 'NgTableParams','ProductsFactory', '$mdDialog',
 '$mdToast', function($scope, $state, NgTableParams, ProductsFactory, $mdDialog, $mdToast){

   $scope.confirmDeleteProduct = function(product) {
    var options = {
        templateUrl: '../app/shared/templates/confirm_delete_product.tpl.html',
        parent: angular.element(document.body),
        clickOutsideToClose:true,
        fullscreen: false,
        controller: ['$scope', function($scope) {
          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.product = product;
        }]
      };

    function reload_table(table) {
      if (table.page() == 1) {
        table.reload();
      } else {
        table.page(1);
      }
    }

    $mdDialog.show(options).then(function() {
      ProductsFactory.deleteProduct(product.product_id).then(function(data) {
          $mdToast.show(
            $mdToast.simple()
              .textContent('Product ' + product.name + ' deleted')
              .hideDelay(3000)
              .position('top right')
              .parent(angular.element(document.querySelector('#toastTo')))
          );
          if (product.is_approved) {
            reload_table($scope.inventory.tableParams);
          } else {
            reload_table($scope.unapproved_inventory.tableParams);
          }
      }, $scope.showApiError);
    });
   };

  $scope.inventory = {
    tableParams: new NgTableParams({}, {
        getData: function(params) {
          query = {page: params.page()};
          return ProductsFactory.getInventory(query).then(
            function(data){
              params.total(data.count);
              if (params.count() != data.page_size) {
                params.count(data.page_size);
              }
              return data.results;
            },
            $scope.showApiError);
        },
        counts: []
      })
  };

  $scope.unapproved_inventory = {
    tableParams: new NgTableParams({}, {
        getData: function(params) {
          query = {page: params.page()};
          return ProductsFactory.getUnapprovedInventory(query).then(
            function(data){
              params.total(data.count);
              if (params.count() != data.page_size) {
                params.count(data.page_size);
              }
              return data.results;
            },
            $scope.showApiError);
        },
        counts: []
      })
  };

  $scope.incomplete_products = {
    tableParams: new NgTableParams({}, {
        getData: function(params) {
          query = {page: params.page()};
          return ProductsFactory.getIncompleteProducts(query).then(
            function(data){
              params.total(data.count);
              if (params.count() != data.page_size) {
                params.count(data.page_size);
              }
              return data.results;
            },
            $scope.showApiError);
        },
        counts: []
      })
  };
}])
.controller( 'UploadInventoryCtrl', [ '$scope', 'configuration', 'NgTableParams','ProductsFactory',
'CategoriesFactory','AttributesFactory', '$state', 'FileUploader', 'StorageService', '$rootScope',
  function($scope, configuration, NgTableParams, ProductsFactory, CategoriesFactory, AttributesFactory,
     $state, FileUploader, StorageService, $rootScope){

  $scope.uploaded_products = [];

  $scope.forms = [];
  $scope.lastId = 1;
  $scope.formData = {
    id: angular.copy($scope.lastId),
    data:{
      sku: "",
      quantity: "",
      attributes: []
    }
  };

  $scope.forms.push(angular.copy($scope.formData));

  $scope.excel_uploader = new FileUploader({
      url: configuration.webApi.products.bulk_upload,
      method: 'POST',
      headers: {
        Authorization: "Token " + StorageService.get('token')
      }
  });

  $scope.excel_uploader.onCompleteItem = function(item, response, status, headers) {
    if (status == 200) {
      var first_sheet = Object.getOwnPropertyNames(response)[0];
      $scope.uploaded_products = response[first_sheet];
    } else {
      $scope.showApiError(response.data);
    }
  };
  $scope.excel_uploader.onAfterAddingFile = function(item) {
    item.upload();
  };

  $scope.createProducts = function(product){
    angular.forEach($scope.uploaded_products, function(product) {
      ProductsFactory.createProductIncomplete(product).then(function(data){
        product.status = 'success';
        $scope.checkUploadedAmount();
      });
    });
  };

  $scope.checkUploadedAmount = function() {
    var count = 0;
    $scope.uploaded_products.forEach(function(obj, index, array) {
      if (obj.status !== undefined) {
        count++;
      }
    });
    if ($scope.uploaded_products.length == count) {
      $scope.goToInventory();
    }
  };

  $scope.cancelUpload = function(){
    $scope.uploaded_products = [];
    $scope.excel_uploader.clearQueue();
    angular.element("#FileBulkUploadInput").val(null);
  };

  $scope.currencies = [];
  $scope.selected_price_currency = {
    "data": null
  };
  $scope.selected_category = {
    "data": null
  };

  $scope.status = { "value": null };
  $rootScope.product_id = { "value": null };
  $scope.product = {};
  $scope.units = [];
  $scope.attributes = [];
  $scope.boolean_attributes = [];
  $scope.not_boolean_attributes = [];
  $scope.attributes_names = [];
  $scope.categories = [];


  CategoriesFactory.getCategories().then(function(data){
    $scope.categories = data;
  }, $scope.showApiError);

  ProductsFactory.getCurrencies().then(function(data){
    $scope.currencies = data;
  },  $scope.showApiError);

  $scope.loadAttributes = function(category){
    AttributesFactory.getAttributes(category.id).then(function(data){
      category.attributes = data;
      $scope.attributes_names = data;
      $scope.not_boolean_attributes = data.filter(function(obj){
        return !obj.is_boolean;
      });
      $scope.boolean_attributes = data.filter(function(obj) {
        return obj.is_boolean;
      });
    }, $scope.showApiError);
  };

  $scope.createProduct = function(){
    $scope.product.category = $scope.selected_category.data.id;
    $scope.product.price_currency = $scope.selected_price_currency.data.code;
    var units = [];
    $scope.forms.forEach(function(obj, index, array) {
      var unit = {
        attributes: []
      };
      unit.sku = obj.data.sku;
      unit.quantity = obj.data.quantity;
      obj.data.attributes.forEach(function(obj, index, array){
        unit.attributes.push(obj.id);
      });
      units.push(unit);
    });
    $scope.product.units = units;

    $scope.product.properties = $scope.boolean_attributes
        .filter(function(obj){
          return obj.selected;
        })
        .map(function(obj) {
          return obj.id;
        });

    ProductsFactory.createProduct($scope.product).then(function(data){
      $scope.status.value = 'success';
      $scope.product = data;
      uploadAllFiles();
      $scope.goToInventory();
    }, function(error){
      $scope.status.value = 'error';
    });
  };

  $scope.goToInventory = function(){
    $state.go("my_inventory");
  };

  // Images Uploader
  $scope.uploader = new FileUploader({
      url: configuration.webApi.products.image_upload + $scope.product.id + '/',
      method: 'POST',
      headers: {
        Authorization: "Token " + StorageService.get('token')
      }
  });

  // Main Image Uploader
  $scope.main_image_uploader = new FileUploader({
      url: configuration.webApi.products.image_upload + $scope.product.id + '/main/',
      method: 'POST',
      headers: {
        Authorization: "Token " + StorageService.get('token')
      }
  });

  $scope.infographic_uploader = new FileUploader({
      url: configuration.webApi.products.image_upload + $scope.product.id + '/infographic/',
      method: 'POST',
      headers: {
        Authorization: "Token " + StorageService.get('token')
      }
  });

  function uploadAllFiles() {
      if($scope.product.id && $scope.uploader.getNotUploadedItems().length){
        $scope.uploader.uploadAll();
      }
      if ($scope.product.id && $scope.main_image_uploader.getNotUploadedItems().length) {
        $scope.main_image_uploader.uploadAll();
      }
      if ($scope.product.id && $scope.infographic_uploader.getNotUploadedItems().length) {
        $scope.infographic_uploader.uploadAll();
      }
  }

  // FILTERS
  var image_filter = {
      name: 'imageFilter',
      fn: function(item /*{File|FileLikeObject}*/, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
  };
  $scope.uploader.filters.push(image_filter);
  $scope.main_image_uploader.filters.push(image_filter);
  $scope.infographic_uploader.filters.push(image_filter);

  //ADD SPECIFIC INFORMATION
  $scope.addSpecificInformation = function(){
    $scope.newFormData=[];
    $scope.lastId++;
    $scope.newFormData = angular.copy($scope.formData);
    $scope.newFormData.id = angular.copy($scope.lastId);
    $scope.forms.push($scope.newFormData);
  };

  // CALLBACKS
  $scope.main_image_uploader.onBeforeUploadItem = function(item) {
        item.url = configuration.webApi.products.image_upload + $scope.product.id + '/main/';
    };
  $scope.infographic_uploader.onBeforeUploadItem = function(item) {
        item.url = configuration.webApi.products.image_upload + $scope.product.id + '/infographic/';
    };

  $scope.main_image_uploader.onAfterAddingFile = function(item) {
      if (this.queue.length > 1) {
        this.removeFromQueue ($scope.main_image_uploader.queue[0]);
      }
    };

  $scope.uploader.onBeforeUploadItem = function(item) {
      item.url = configuration.webApi.products.image_upload + $scope.product.id + '/';
  };
}])

.controller( 'EditProductCtrl', [ '$scope', '$stateParams', 'configuration', 'NgTableParams','ProductsFactory','CategoriesFactory',
  'AttributesFactory', '$state', 'FileUploader', 'StorageService', '$mdToast', 'product',
  function($scope, $stateParams, configuration, NgTableParams, ProductsFactory, CategoriesFactory, AttributesFactory, $state,
     FileUploader, StorageService, $mdToast, product){

  $scope.goToInventory = function(){
    $state.go("my_inventory");
  };
  $scope.errors = {};
  $scope.currencies = [];
  $scope.attributes = [];
  $scope.boolean_attributes = [];
  $scope.not_boolean_attributes = [];
  $scope.categories = [];
  $scope.product_attributes = {};

  $scope.addSpecificInformation = function(){
    var formdata = {
      sku: null,
      quantity: null,
      selected_attribute: []
    };
    $scope.product.units.push(formdata);
  };

  $scope.removeImage = function(image) {
    $scope.product.remove_images.push(image.id);
    var delete_pos = $scope.product.images.findIndex(function(obj, index, array) {
      return obj.id == image.id;
    });
    $scope.product.images.splice(delete_pos, 1);
    $mdToast.show(
      $mdToast.simple()
        .textContent('Image deleted')
        .hideDelay(3000)
        .position('top right')
        .action("Undo")
        .parent(angular.element(document.querySelector('#toastTo')))
      ).then(function(data) {
        if (data === 'ok') {
          var pos = $scope.product.remove_images.indexOf(image.id);
          $scope.product.remove_images.splice(pos, 1);
          $scope.product.images.splice(delete_pos, 0, image);
        }
      });
  };

  $scope.removeInfographic = function(infographic) {
    $scope.product.remove_infographics.push(infographic.id);
    var delete_pos = $scope.product.infographics.findIndex(function(obj, index, array) {
      return obj.id == infographic.id;
    });
    $scope.product.infographics.splice(delete_pos, 1);
  };

  function showUnitsAttribtues() {
    if ($scope.product && $scope.attributes !== undefined && $scope.attributes.length > 0) {
      /* Show already set boolean attribtues */
      if (Array.isArray($scope.product.properties)) {
        $scope.product.properties.forEach(function(prop, index, array) {
          $scope.boolean_attributes.forEach(function(obj, attr_idnex, array) {
            if (obj.id == prop) {
              obj.selected = true;
            }
          });
        });
      }
      /* Show attributes for existing units */
      $scope.product.units.forEach(function(unit, unit_index, array) {
        unit.selected_attribute = [];
        $scope.attributes.forEach(function(attr, attr_index, array) {
          if (attr.is_boolean) {
            return;
          }
          var value = null;
          unit.attributes.forEach(function(unit_attr) {
            if (unit_attr.attribute == attr.id) {
              value = unit_attr.value;
            }
          });
          unit.selected_attribute.push(value);
        });
      });
    }
  }

  CategoriesFactory.getCategories().then(function(data){
    $scope.categories = data;
  }, $scope.showApiError);

  ProductsFactory.getCurrencies().then(function(data){
    $scope.currencies = data;
  }, $scope.showApiError);

  $scope.loadAttributes = function(categoryId){
    AttributesFactory.getAttributes(categoryId).then(function(data){
      $scope.attributes = data;
      $scope.not_boolean_attributes = data.filter(function(obj){
        return !obj.is_boolean;
      });
      $scope.boolean_attributes = data.filter(function(obj) {
        return obj.is_boolean;
      });
      showUnitsAttribtues();
    }, $scope.showApiError);
  };

  $scope.saveProduct = function(){
    if (product !== null) {
      updateProduct();
    } else {
      createProductFromIncomplete();
    }
  };

  function getFormatedProductInformation() {
      var product = angular.copy($scope.product);
      product.properties = $scope.boolean_attributes
          .filter(function(obj){
            return obj.selected;
          })
          .map(function(obj) {
            return obj.id;
          });

      product.units.forEach(function(unit, index, array) {
        var notnull_selected_attributes = [];
        unit.selected_attribute.forEach(function(selected){
          if (selected != null) {
            notnull_selected_attributes.push(selected);
          }
        });
        unit.attributes = notnull_selected_attributes;
        delete unit.selected_attribute;
      });
      return product;
  }

  function uploadAllFiles() {
      if($scope.uploader.getNotUploadedItems().length){
        $scope.uploader.uploadAll();
      }
      if ($scope.main_image_uploader.getNotUploadedItems().length) {
        $scope.main_image_uploader.uploadAll();
      }
      if ($scope.infographic_uploader.getNotUploadedItems().length) {
        $scope.infographic_uploader.uploadAll();
      }
  }

  function updateProduct() {
    var product = getFormatedProductInformation();
    ProductsFactory.updateProduct(product).then(function(data){
      uploadAllFiles();
      $scope.goToInventory();
    }, $scope.showApiError);
  }

  function createProductFromIncomplete() {
    var product = getFormatedProductInformation();
    delete product.id;
    var query_params = {
      incomplete_product: $scope.product.id
    };
    ProductsFactory.createProduct(product, query_params).then(function(data){
      uploadAllFiles();
      $scope.goToInventory();
    }, $scope.showApiError);
  }

  // Images Upload
  $scope.uploader = new FileUploader({
      url: configuration.webApi.products.image_upload + $stateParams.productId + '/',
      method: 'POST',
      headers: {
        Authorization: "Token " + StorageService.get('token')
      }
  });

  // Main Image Uploader
  $scope.main_image_uploader = new FileUploader({
      url: configuration.webApi.products.image_upload + $stateParams.productId + '/main/',
      method: 'POST',
      headers: {
        Authorization: "Token " + StorageService.get('token')
      }
  });

  $scope.infographic_uploader = new FileUploader({
      url: configuration.webApi.products.image_upload + $stateParams.productId + '/infographic/',
      method: 'POST',
      headers: {
        Authorization: "Token " + StorageService.get('token')
      }
  });

  // FILTERS
  var image_filter = {
      name: 'imageFilter',
      fn: function(item /*{File|FileLikeObject}*/, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
  };
  $scope.uploader.filters.push(image_filter);
  $scope.main_image_uploader.filters.push(image_filter);
  $scope.infographic_uploader.filters.push(image_filter);

  // CALLBACKS
  $scope.main_image_uploader.onBeforeUploadItem = function(item) {
        item.url = configuration.webApi.products.image_upload + $scope.product.id + '/main/';
    };
  $scope.infographic_uploader.onBeforeUploadItem = function(item) {
        item.url = configuration.webApi.products.image_upload + $scope.product.id + '/infographic/';
    };
  $scope.main_image_uploader.onAfterAddingFile = function(item) {
      if (this.queue.length > 1) {
        this.removeFromQueue ($scope.main_image_uploader.queue[0]);
      }
    };
  $scope.uploader.onBeforeUploadItem = function(item) {
      item.url = configuration.webApi.products.image_upload + $scope.product.id + '/';
  };

  if (product !== null) {
      product.price_amount = parseFloat(product.price_amount);
      product.remove_images = [];
      product.remove_infographics = [];
      $scope.product = product;
      $scope.loadAttributes(product.category);
  } else if ($stateParams.incomplete_product !== null) {
    $scope.product = $stateParams.incomplete_product;
    $scope.product.price_amount = parseFloat($scope.product.price_amount);
  } else {
    $scope.goToInventory();
  }

}]);
