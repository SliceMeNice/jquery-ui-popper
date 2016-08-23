/*!
 * Popper – a tooltip / popup base class based on jQuery UI Widget
 * Author: office@slicemenice.de
 * Licensed under the MIT license
 *
 *  Requires UI version 1.9+
 */
( function ( $, window, document, undefined ) {

	$.widget( 'smn.popper', {
		// *********
		// Options
		// *********

		options: {
			autoClose: 'group', // false | 'group' | 'all'
			group: 'default',
			popper: '.popper',
			trigger: '.trigger'
		},


		// *********
		// Methods
		// *********

		close: function( options ) {
			var widget = this;
			widget._isOpen = false;
		},

		_create: function() {
			var widget = this;

			$.smn.popper.groups[ widget.options.group ] = $.smn.popper.groups[ widget.options.group ] || [];
			$.smn.popper.groups[ widget.options.group ].push( widget.element.get( 0 ) );

			widget.$trigger = jQuery.type( widget.options.trigger ) === 'string' ? widget.element.find( widget.options.trigger ) : $( widget.options.trigger );
			widget.$popper = jQuery.type( widget.options.popper ) === 'string' ? widget.element.find( widget.options.popper ) : $( widget.options.popper );

			widget._on( true, document, {
				'touchstart': widget._onClickOutside,
				'click': widget._onClickOutside
			} );

			widget._isOpen = false;
		},

		destroy: function(){
			var widget = this;

			var index = $.inArray( widget.element, $.smn.popper.groups[ widget.options.group ] );

			if ( index > -1 ) {
				$.smn.popper.groups[ widget.options.group ].splice( index, 1 );
			}
		},

		_onClickOutside: function( event ) {
			var widget = this;

			if ( !widget.$popper.length ) {
				return;
			}

			if ( !widget._isOpen ) {
				// early-out, if the widget is not open
				return;
			}

			var $eventTarget = $( event.target );

			// prevent default behavior on links clicked
			if ( event.type === 'click' && ( $eventTarget.is( 'a' ) || $eventTarget.closest( 'a' ).length ) ) {
				// but only if the link is neither the popper itselt nor contained in the popper
				if ( !$eventTarget.is( widget.$popper ) && !$.contains( widget.$popper[ 0 ], $eventTarget[ 0 ] ) ) {
					event.preventDefault();
				}
			}

			if ( !widget.$trigger.has( event.target ).length &&
			     !$.contains( widget.$trigger.get( 0 ), event.target ) &&
			     !widget.$popper.has( event.target ).length &&
			     !$.contains( widget.$popper.get( 0 ), event.target ) ) {
				widget.close();
				event.stopImmediatePropagation();
			}
		},

		_getAllOtherElements: function() {
			var result = [];

			$.each( $.smn.popper.groups, function( groupId ) {
				$.merge( result, widget._getOtherElementsInGroup( groupId ) );
			} );

			return result;
		},

		_getOtherElementsInGroup: function( groupId ) {
			var widget = this;

			return $.grep( $.smn.popper.groups[ groupId ], function( element ) {
				return element !== widget.element.get( 0 );
			} );
		},

		isOpen: function() {
			var widget = this;
			return widget._isOpen;
		},

		open: function( options ) {
			var widget = this;

			$elementsToClose = [];

			switch ( widget.options.autoClose ) {
				case 'group':
					$elementsToClose = widget._getOtherElementsInGroup( widget.options.group );
					break;

				case 'all':
					$elementsToClose = widget._getAllOtherElements();
					break;
			}

			$.each( $elementsToClose, function() {
				var $elementToClose = $( this );

				if ( $elementToClose.data( widget.widgetName ) && $elementToClose[ widget.widgetName ]( 'isOpen' ) ) {
					$elementToClose[ widget.widgetName ]( 'close' );
				}
			} );

			widget._isOpen = true;
		}
	} );

	$.extend( $.smn.popper, {

		// store groups / lists of popper elements, so we can close
		// all other poppers of a group, when a popper is opened
		//
		// groups might be useful when handling multi-level menus,
		// where the previous-level menu should stay open, when a new
		// new menu level is opened
		groups: {
			default: []
		}

	} );

} )( window.jQuery, window, document );