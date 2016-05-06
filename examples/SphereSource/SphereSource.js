/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(1);

	var _2 = _interopRequireDefault(_);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Create cone source instance
	var sphereSource = _2.default.newInstance();

	// Create dataset
	console.log('Output (sphere)', sphereSource.getOutput());

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.sphereSource = sphereSource;

	var _macro = __webpack_require__(2);

	var macro = _interopRequireWildcard(_macro);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	// ----------------------------------------------------------------------------

	var STD_FIELDS = ['radius', 'latLongTessellation', 'thetaResolution', 'startTheta', 'endTheta', 'phiResolution', 'startPhi', 'endPhi'];

	var ARRAY_FIELDS_3 = ['center'];

	// ----------------------------------------------------------------------------
	// SphereSource methods
	// ----------------------------------------------------------------------------

	function sphereSource(publicAPI, model) {
	  function update() {
	    if (model.deleted) {
	      return;
	    }

	    var dataset = model.output[0];
	    if (!dataset || dataset.mtime !== model.mtime) {
	      (function () {
	        var state = {};
	        dataset = {
	          type: 'PolyData',
	          mtime: model.mtime,
	          metadata: {
	            source: 'SphereSource',
	            state: state
	          },
	          PolyData: {
	            Points: {
	              type: 'DataArray',
	              name: '_points',
	              tuple: 3,
	              dataType: model.pointType
	            },
	            Cells: {
	              Polys: {
	                type: 'DataArray',
	                name: '_polys',
	                tuple: 1,
	                dataType: 'Uint32Array'
	              }
	            },
	            PointData: {
	              Normals: {
	                type: 'DataArray',
	                name: 'Normals',
	                tuple: 3,
	                dataType: 'Float32Array'
	              }
	            }
	          }
	        };

	        // Add parameter used to create dataset as metadata.state[*]
	        STD_FIELDS.forEach(function (field) {
	          state[field] = model[field];
	        });
	        ARRAY_FIELDS_3.forEach(function (field) {
	          state[field] = [].concat(model[field]);
	        });

	        // ----------------------------------------------------------------------
	        var numPoles = 0;
	        var deltaTheta = (model.endTheta - model.startTheta) / model.thetaResolution;
	        var numPts = model.phiResolution * model.thetaResolution + 2;
	        var numPolys = model.phiResolution * 2 * model.thetaResolution;

	        // Points
	        var pointIdx = 0;
	        var points = new window[dataset.PolyData.Points.dataType](numPts * 3);
	        dataset.PolyData.Points.values = points;
	        dataset.PolyData.Points.size = numPts * 3;

	        // Normals
	        var normals = new Float32Array(numPts * 3);
	        dataset.PolyData.PointData.Normals.values = normals;
	        dataset.PolyData.PointData.Normals.size = numPts * 3;

	        // Cells
	        var cellLocation = 0;
	        var polys = new window[dataset.PolyData.Cells.Polys.dataType](numPolys * 5); // FIXME array size
	        dataset.PolyData.Cells.Polys.values = polys;

	        // Create north pole if needed
	        if (model.startPhi <= 0.0) {
	          points[pointIdx * 3 + 0] = model.center[0];
	          points[pointIdx * 3 + 1] = model.center[1];
	          points[pointIdx * 3 + 2] = model.center[2] + model.radius;

	          normals[pointIdx * 3 + 0] = 0;
	          normals[pointIdx * 3 + 1] = 0;
	          normals[pointIdx * 3 + 2] = 1;

	          pointIdx++;
	          numPoles++;
	        }

	        // Create south pole if needed
	        if (model.endPhi >= 180.0) {
	          points[pointIdx * 3 + 0] = model.center[0];
	          points[pointIdx * 3 + 1] = model.center[1];
	          points[pointIdx * 3 + 2] = model.center[2] - model.radius;

	          normals[pointIdx * 3 + 0] = 0;
	          normals[pointIdx * 3 + 1] = 0;
	          normals[pointIdx * 3 + 2] = -1;

	          pointIdx++;
	          numPoles++;
	        }

	        // Check data, determine increments, and convert to radians
	        var thetaResolution = model.thetaResolution;
	        var startTheta = model.startTheta < model.endTheta ? model.startTheta : model.endTheta;
	        startTheta *= Math.PI / 180.0;
	        var endTheta = model.endTheta > model.startTheta ? model.endTheta : model.startTheta;
	        endTheta *= Math.PI / 180.0;

	        var startPhi = model.startPhi < model.endPhi ? model.startPhi : model.endPhi;
	        startPhi *= Math.PI / 180.0;
	        var endPhi = model.endPhi > model.startPhi ? model.endPhi : model.startPhi;
	        endPhi *= Math.PI / 180.0;

	        var phiResolution = model.phiResolution - numPoles;
	        var deltaPhi = (endPhi - startPhi) / (model.phiResolution - 1);

	        if (Math.abs(startTheta - endTheta) < 360.0) {
	          ++thetaResolution;
	        }

	        var jStart = model.startPhi <= 0.0 ? 1 : 0;
	        var jEnd = model.phiResolution + (model.endPhi >= 180.0 ? -1 : 0);

	        // Create intermediate points
	        for (var i = 0; i < thetaResolution; i++) {
	          var theta = startTheta * Math.PI / 180.0 + i * deltaTheta;
	          for (var j = jStart; j < jEnd; j++) {
	            var phi = startPhi + j * deltaPhi;
	            var radius = model.radius * Math.sin(phi);

	            normals[pointIdx * 3 + 0] = radius * Math.cos(theta);
	            normals[pointIdx * 3 + 1] = radius * Math.sin(theta);
	            normals[pointIdx * 3 + 2] = model.radius * Math.cos(phi);

	            points[pointIdx * 3 + 0] = normals[pointIdx * 3 + 0] + model.center[0];
	            points[pointIdx * 3 + 1] = normals[pointIdx * 3 + 1] + model.center[1];
	            points[pointIdx * 3 + 2] = normals[pointIdx * 3 + 2] + model.center[2];

	            var norm = Math.sqrt(normals[pointIdx * 3 + 0] * normals[pointIdx * 3 + 0] + normals[pointIdx * 3 + 1] * normals[pointIdx * 3 + 1] + normals[pointIdx * 3 + 2] * normals[pointIdx * 3 + 2]);

	            norm = norm === 0 ? 1 : norm;
	            normals[pointIdx * 3 + 0] /= norm;
	            normals[pointIdx * 3 + 1] /= norm;
	            normals[pointIdx * 3 + 2] /= norm;

	            pointIdx++;
	          }
	        }

	        // Generate mesh connectivity
	        var base = phiResolution * thetaResolution;

	        if (Math.abs(startTheta - endTheta) < 360.0) {
	          --thetaResolution;
	        }

	        // around north pole
	        if (model.startPhi <= 0.0) {
	          for (var _i = 0; _i < thetaResolution; _i++) {
	            polys[cellLocation++] = 3;
	            polys[cellLocation++] = phiResolution * _i + numPoles;
	            polys[cellLocation++] = phiResolution * (_i + 1) % base + numPoles;
	            polys[cellLocation++] = 0;
	          }
	        }

	        // around south pole
	        if (model.endPhi >= 180.0) {
	          var numOffset = phiResolution - 1 + numPoles;

	          for (var _i2 = 0; _i2 < thetaResolution; _i2++) {
	            polys[cellLocation++] = 3;
	            polys[cellLocation++] = phiResolution * _i2 + numOffset;
	            polys[cellLocation++] = phiResolution * (_i2 + 1) % base + numOffset;
	            polys[cellLocation++] = numPoles - 1;
	          }
	        }

	        // bands in-between poles
	        for (var _i3 = 0; _i3 < thetaResolution; _i3++) {
	          for (var _j = 0; _j < phiResolution - 1; _j++) {
	            var a = phiResolution * _i3 + _j + numPoles;
	            var b = points[pointIdx * 3 + 0] + 1;
	            var c = (phiResolution * (_i3 + 1) + _j) % base + numPoles + 1;

	            if (!model.latLongTessellation) {
	              polys[cellLocation++] = 3;
	              polys[cellLocation++] = a;
	              polys[cellLocation++] = b;
	              polys[cellLocation++] = c;
	              polys[cellLocation++] = 3;
	              polys[cellLocation++] = a;
	              polys[cellLocation++] = c;
	              polys[cellLocation++] = c - 1;
	            } else {
	              polys[cellLocation++] = 4;
	              polys[cellLocation++] = a;
	              polys[cellLocation++] = b;
	              polys[cellLocation++] = c;
	              polys[cellLocation++] = c - 1;
	            }
	          }
	        }

	        // Squeeze
	        points = points.subarray(0, pointIdx * 3);
	        dataset.PolyData.Points.values = points;
	        dataset.PolyData.Points.size = pointIdx * 3;

	        normals = normals.subarray(0, pointIdx * 3);
	        dataset.PolyData.PointData.Normals.values = normals;
	        dataset.PolyData.PointData.Normals.size = pointIdx * 3;

	        polys = polys.subarray(0, cellLocation);
	        dataset.PolyData.Cells.Polys.values = polys;
	        dataset.PolyData.Cells.Polys.size = cellLocation;

	        // Update output
	        model.output[0] = dataset;
	      })();
	    }
	  }

	  // Expose methods
	  publicAPI.update = update;
	}

	// ----------------------------------------------------------------------------
	// Object factory
	// ----------------------------------------------------------------------------

	var DEFAULT_VALUES = {
	  radius: 0.5,
	  latLongTessellation: false,
	  thetaResolution: 8,
	  startTheta: 0.0,
	  endTheta: 360.0,
	  phiResolution: 8,
	  startPhi: 0.0,
	  endPhi: 360.0,
	  center: [0, 0, 0],
	  pointType: 'Float32Array'
	};

	// ----------------------------------------------------------------------------

	function newInstance() {
	  var initialValues = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	  var model = Object.assign({}, DEFAULT_VALUES, initialValues);
	  var publicAPI = {};

	  // Build VTK API
	  macro.obj(publicAPI, model);
	  macro.setGet(publicAPI, model, STD_FIELDS);
	  macro.setGetArray(publicAPI, model, ARRAY_FIELDS_3, 3);
	  macro.algo(publicAPI, model, 0, 1);

	  // Object methods
	  sphereSource(publicAPI, model);

	  return Object.freeze(publicAPI);
	}

	// ----------------------------------------------------------------------------

	exports.default = { newInstance: newInstance };

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.capitalize = capitalize;
	exports.obj = obj;
	exports.get = get;
	exports.set = set;
	exports.setGet = setGet;
	exports.getArray = getArray;
	exports.setArray = setArray;
	exports.setGetArray = setGetArray;
	exports.algo = algo;
	exports.event = event;
	// ----------------------------------------------------------------------------
	// capitilze provided string
	// ----------------------------------------------------------------------------

	function capitalize(str) {
	  return str.charAt(0).toUpperCase() + str.slice(1);
	}

	// ----------------------------------------------------------------------------
	// vtkObject: modified(), onModified(callback), delete()
	// ----------------------------------------------------------------------------

	function obj(publicAPI, model) {
	  var callbacks = [];
	  model.mtime = 1;

	  function off(index) {
	    callbacks[index] = null;
	  }

	  function on(index) {
	    function unsubscribe() {
	      off(index);
	    }
	    return Object.freeze({ unsubscribe: unsubscribe });
	  }

	  publicAPI.modified = function () {
	    if (model.deleted) {
	      console.log('instance deleted - can not call any method');
	      return;
	    }

	    ++model.mtime;
	    callbacks.forEach(function (callback) {
	      return callback && callback(publicAPI);
	    });
	  };

	  publicAPI.onModified = function (callback) {
	    if (model.deleted) {
	      console.log('instance deleted - can not call any method');
	      return null;
	    }

	    var index = callbacks.length;
	    callbacks.push(callback);
	    return on(index);
	  };

	  publicAPI.delete = function () {
	    Object.keys(model).forEach(function (field) {
	      return delete model[field];
	    });
	    callbacks.forEach(function (el, index) {
	      return off(index);
	    });

	    // Flag the instance beeing deleted
	    model.deleted = true;
	  };
	}

	// ----------------------------------------------------------------------------
	// getXXX: add getters
	// ----------------------------------------------------------------------------

	function get(publicAPI, model, fieldNames) {
	  fieldNames.forEach(function (field) {
	    publicAPI['get' + capitalize(field)] = function () {
	      return model[field];
	    };
	  });
	}

	// ----------------------------------------------------------------------------
	// setXXX: add setters
	// ----------------------------------------------------------------------------

	function set(publicAPI, model, fieldNames) {
	  function createSetter(field) {
	    function setter(value) {
	      if (model.deleted) {
	        console.log('instance deleted - can not call any method');
	        return;
	      }

	      if (model[field] !== value) {
	        model[field] = value;
	        publicAPI.modified();
	      }
	    }

	    publicAPI['set' + capitalize(field)] = setter;
	  }

	  fieldNames.forEach(createSetter);
	}

	// ----------------------------------------------------------------------------
	// set/get XXX: add both setters and getters
	// ----------------------------------------------------------------------------

	function setGet(publicAPI, model, fieldNames) {
	  get(publicAPI, model, fieldNames);
	  set(publicAPI, model, fieldNames);
	}

	// ----------------------------------------------------------------------------
	// getXXX: add getters for object of type array
	// ----------------------------------------------------------------------------

	function getArray(publicAPI, model, fieldNames) {
	  fieldNames.forEach(function (field) {
	    publicAPI['get' + capitalize(field)] = function () {
	      return [].concat(model[field]);
	    };
	  });
	}

	// ----------------------------------------------------------------------------
	// setXXX: add setter for object of type array
	// ----------------------------------------------------------------------------

	function setArray(publicAPI, model, fieldNames, size) {
	  fieldNames.forEach(function (field) {
	    publicAPI['set' + capitalize(field)] = function (array) {
	      if (model.deleted) {
	        console.log('instance deleted - can not call any method');
	        return;
	      }

	      var changeDetected = false;
	      model[field].forEach(function (item, index) {
	        if (item !== array[index]) {
	          if (changeDetected) {
	            return;
	          }
	          changeDetected = true;
	        }
	      });

	      if (changeDetected) {
	        model[field] = [].concat(array);
	        publicAPI.modified();
	      }
	    };
	  });
	}

	// ----------------------------------------------------------------------------
	// set/get XXX: add setter and getter for object of type array
	// ----------------------------------------------------------------------------

	function setGetArray(publicAPI, model, fieldNames, size) {
	  getArray(publicAPI, model, fieldNames);
	  setArray(publicAPI, model, fieldNames, size);
	}

	// ----------------------------------------------------------------------------
	// vtkAlgorithm: setInputData(), setInputConnection(), getOutput(), getOutputPort()
	// ----------------------------------------------------------------------------

	function algo(publicAPI, model, numberOfInputs, numberOfOutputs) {
	  model.inputData = [];
	  model.inputConnection = [];
	  model.output = [];

	  // Methods
	  function setInputData(dataset) {
	    var port = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

	    if (model.deleted) {
	      console.log('instance deleted - can not call any method');
	      return;
	    }
	    model.inputData[port] = dataset;
	    model.inputConnection[port] = null;
	  }

	  function setInputConnection(outputPort) {
	    var port = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

	    if (model.deleted) {
	      console.log('instance deleted - can not call any method');
	      return;
	    }
	    model.inputData[port] = null;
	    model.inputConnection[port] = outputPort;
	  }

	  function getOutput() {
	    var port = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

	    if (model.deleted) {
	      console.log('instance deleted - can not call any method');
	      return null;
	    }
	    publicAPI.update();
	    return model.output[port];
	  }

	  function getOutputPort() {
	    var port = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

	    return function () {
	      return getOutput(port);
	    };
	  }

	  // Handle input if needed
	  if (numberOfInputs) {
	    // Reserve inputs
	    var count = numberOfInputs;
	    while (count--) {
	      model.inputData.push(null);
	      model.inputConnection.push(null);
	    }

	    // Expose public methods
	    publicAPI.setInputData = setInputData;
	    publicAPI.setInputConnection = setInputConnection;
	  }

	  if (numberOfOutputs) {
	    publicAPI.getOutput = getOutput;
	    publicAPI.getOutputPort = getOutputPort;
	  }
	}

	// ----------------------------------------------------------------------------
	// Event handling: onXXX(callback), fireXXX(args...)
	// ----------------------------------------------------------------------------

	function event(publicAPI, model, eventName) {
	  var callbacks = [];
	  var previousDelete = publicAPI.delete;

	  function off(index) {
	    callbacks[index] = null;
	  }

	  function on(index) {
	    function unsubscribe() {
	      off(index);
	    }
	    return Object.freeze({ unsubscribe: unsubscribe });
	  }

	  publicAPI['fire' + capitalize(eventName)] = function () {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    if (model.deleted) {
	      console.log('instance deleted - can not call any method');
	      return;
	    }

	    callbacks.forEach(function (callback) {
	      return callback && callback.apply(publicAPI, args);
	    });
	  };

	  publicAPI['on' + capitalize(eventName)] = function (callback) {
	    if (model.deleted) {
	      console.log('instance deleted - can not call any method');
	      return null;
	    }

	    var index = callbacks.length;
	    callbacks.push(callback);
	    return on(index);
	  };

	  publicAPI.delete = function () {
	    previousDelete();
	    callbacks.forEach(function (el, index) {
	      return off(index);
	    });
	  };
	}

/***/ }
/******/ ]);