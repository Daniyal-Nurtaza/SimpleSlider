'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * SimpleSlider v1.6.0
 * Simple responsive slider created in pure javascript.
 * https://github.com/michu2k/SimpleSlider
 *
 * Copyright 2017-2018 Michał Strumpf
 * Published under MIT License
 */
(function (window) {

	'use strict';

	var slider = {};

	/* simpleSlider */
	var simpleSlider = function simpleSlider(selector, userOptions) {
		// Variables
		var defaults = void 0,
		    v = [];

		// Defaults
		defaults = {
			speed: 2000, // transition duration in ms {number}
			delay: 6000, // delay between transitions in ms {number}
			autoplay: true, // slider autoplay {boolean}
			animation: true, // turn on/off slider animation {boolean}
			classes: {
				wrapper: 'slider-wrapper', // wrapper class {string}
				slide: 'slider-slide', // slide class {string}
				buttons: 'slider-btn', // buttons class {string}
				pagination: 'slider-pagination', // pagination class {string}
				paginationItem: 'pagination-bullet' // pagination bullet class {string}
			}
		};

		// Set options
		v.options = slider.extendDefaults(defaults, userOptions);

		// Elements
		v.container = document.querySelector(selector);
		v.wrapper = v.container.querySelector('.' + v.options.classes.wrapper);
		v.buttons = v.container.querySelectorAll('.' + v.options.classes.buttons);
		v.slides = v.container.querySelectorAll('.' + v.options.classes.slide);
		v.pagination = v.container.querySelector('.' + v.options.classes.pagination);
		v.disable = false;
		v.index;
		v.timer;

		// Call functions
		slider.createClones(v);
		slider.setWidth(v);
		slider.moveWrapper(v);
		slider.updateData(v);

		// Pagination
		if (v.pagination) {
			slider.createPagination(v);
			slider.bullets(v);
		}

		// Autoplay
		if (v.options.autoplay === true) {
			slider.autoPlay(v);
		}

		// Buttons
		if (v.buttons.length == 2) {
			slider.buttons(v);
		}
	};

	/**
  * Slider main core
  * @param {string} direction = move direction [left, right]
  * @param {object} vars = list of variables
  */
	slider.sliderCore = function (direction, vars) {
		if (typeof vars.index === 'undefined') vars.index = 1;

		// Change index value depending on the direction
		direction == 'left' ? vars.index-- : vars.index++;

		slider.disableEvents(vars);

		// Set transition
		if (vars.options.animation == true) {
			slider.setTransition(vars.options.speed, vars);

			setTimeout(function () {
				slider.setTransition(0, vars);
			}, vars.options.speed);
		} else vars.options.speed = 0;

		// Switch from last cloned to first slide
		if (vars.index > vars.slides.length) {
			setTimeout(function () {
				vars.index = 1;
				slider.moveWrapper(vars);
			}, vars.options.speed);
		}

		// Switch from first cloned to last slide
		if (vars.index == 0) {
			setTimeout(function () {
				vars.index = vars.slides.length;
				slider.moveWrapper(vars);
			}, vars.options.speed);
		}

		slider.moveWrapper(vars);
		slider.highlightBullet(vars);
	};

	/**
  * Create slider pagination
  * @param {object} vars = list of variables
  */
	slider.createPagination = function (vars) {
		var bullet = void 0,
		    fragment = document.createDocumentFragment();

		// Create bullets
		for (var i = 0; i < vars.slides.length; i++) {
			bullet = document.createElement('span');
			bullet.classList.add('' + vars.options.classes.paginationItem);

			if (i == 0) bullet.classList.add('active');

			fragment.appendChild(bullet);
		}

		// Append bullets to the DOM
		vars.pagination.appendChild(fragment);
	};

	/**
  * Move slide when clicked on pagination bullet
  * @param {object} vars = list of variables
  */
	slider.bullets = function (vars) {
		var bullets = vars.pagination.querySelectorAll('.' + vars.options.classes.paginationItem);

		var _loop = function _loop(i) {
			bullets[i].addEventListener('click', function () {

				if (!vars.disable) {
					vars.index = i;
					slider.sliderCore('', vars);

					if (vars.options.autoplay === true) {
						clearInterval(vars.timer);
						setTimeout(function () {
							slider.autoPlay(vars);
						}, vars.options.speed);
					}
				}
			});
		};

		for (var i = 0; i < bullets.length; i++) {
			_loop(i);
		}
	};

	/**
  * Highlight active bullet
  * @param {object} vars = list of variables
  */
	slider.highlightBullet = function (vars) {
		var bullets = vars.pagination.querySelectorAll('.' + vars.options.classes.paginationItem),
		    index = vars.index,
		    previousBullet = void 0;

		if (index > vars.slides.length) index = 1;else if (index == 0) index = vars.slides.length;

		// Remove active class
		for (var i = 0; i < bullets.length; i++) {
			if (bullets[i].classList.contains('active')) bullets[i].classList.remove('active');
		}

		// Add class to active bullet
		bullets[index - 1].classList.add('active');
	};

	/** 
  * Set transition duration
  * @param {number} speed = speed value in miliseconds
  * @param {object} vars = list of variables
  */
	slider.setTransition = function (speed, vars) {
		var transition = slider.getSupportedProperty('TransitionDuration');
		vars.wrapper.style[transition] = speed + 'ms';
	};

	/**
  * Disable events during slider animation
  * @param {object} vars = list of variables
  */
	slider.disableEvents = function (vars) {
		vars.disable = true;

		// Enable Events
		setTimeout(function () {
			vars.disable = false;
		}, vars.options.speed);
	};

	/**
  * Move slide when clicked on button
  * @param {object} vars = list of variables
  */
	slider.buttons = function (vars) {
		var direction = ['left', 'right'];

		var _loop2 = function _loop2(i) {
			vars.buttons[i].addEventListener('click', function () {

				if (!vars.disable) {
					slider.sliderCore(direction[i], vars);

					if (vars.options.autoplay === true) {
						clearInterval(vars.timer);
						setTimeout(function () {
							slider.autoPlay(vars);
						}, vars.options.speed);
					}
				}
			});
		};

		for (var i = 0; i < vars.buttons.length; i++) {
			_loop2(i);
		}
	};

	/** 
  * Slider autoplay 
  * @param {object} vars = list of variables
  */
	slider.autoPlay = function (vars) {
		var delay = vars.options.delay + vars.options.speed;

		vars.timer = setInterval(function () {
			slider.sliderCore('', vars);
		}, delay);
	};

	/**
  * Call functions when window is resized
  * @param {object} vars = list of variables
  */
	slider.updateData = function (vars) {
		window.addEventListener('resize', function () {
			slider.setWidth(vars);
			slider.moveWrapper(vars);
		});
	};

	/**
  * Change wrapper position by a certain number of pixels
  * @param {object} vars = list of variables
  */
	slider.moveWrapper = function (vars) {
		if (typeof vars.index === 'undefined') vars.index = 1;

		var pixels = vars.index * vars.container.offsetWidth;
		vars.wrapper = vars.container.querySelector('.' + vars.options.classes.wrapper);

		var transform = slider.getSupportedProperty('Transform');
		vars.wrapper.style[transform] = 'translate3d( -' + pixels + 'px, 0, 0)';
	};

	/**
  * Set wrapper and slides width
  * @param {object} vars = list of variables
  */
	slider.setWidth = function (vars) {
		var wrapperWidth = void 0,
		    slides = vars.container.querySelectorAll('.' + vars.options.classes.slide);

		// Wrapper width
		wrapperWidth = vars.container.offsetWidth * slides.length;
		vars.wrapper.style.width = wrapperWidth + 'px';

		// Slides width
		for (var i = 0; i < slides.length; i++) {
			slides[i].style.width = vars.container.offsetWidth + 'px';
		}
	};

	/**
  * Clone first and last slide and append them to the DOM
  * @param {object} vars = list of variables
  */
	slider.createClones = function (vars) {
		var firstElement = vars.wrapper.firstElementChild.cloneNode(true),
		    lastElement = vars.wrapper.lastElementChild.cloneNode(true);

		vars.wrapper.appendChild(firstElement);
		vars.wrapper.insertBefore(lastElement, vars.slides[0]);
	};

	/**
  * Get supported property and add prefix if needed
  * @param {string} property = property name
  * @return {string} propertyWithPrefix = property prefix
  */
	slider.getSupportedProperty = function (property) {
		var prefix = ['-', 'webkit', 'moz', 'ms', 'o'],
		    propertyWithPrefix = void 0;

		for (var i = 0; i < prefix.length; i++) {
			if (prefix[i] == '-') propertyWithPrefix = property.toLowerCase();else propertyWithPrefix = prefix[i] + property;

			if (typeof document.body.style[propertyWithPrefix] != 'undefined') {
				return propertyWithPrefix;
			}
		}

		return null;
	};

	/**
  * Extend defaults deep
  * @param {object} defaults = defaults options defined in script
  * @param {object} properties = new options
  * @return {object} defaults = modified options
  */
	slider.extendDefaults = function (defaults, properties) {
		var property = void 0,
		    propertyDeep = void 0;

		if (properties != undefined && properties != 'undefined') {
			for (property in properties) {
				if (_typeof(properties[property]) === 'object') {
					for (propertyDeep in properties[property]) {
						defaults[property][propertyDeep] = properties[property][propertyDeep];
					}
				} else defaults[property] = properties[property];
			}
		}
		return defaults;
	};

	window.simpleSlider = simpleSlider;
})(window);