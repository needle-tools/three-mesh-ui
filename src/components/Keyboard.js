/*

Job: high-level component that returns a keyboard

*/

import BoxComponent from './core/BoxComponent.js';
import Block from './Block.js';
import Text from './Text.js';
import keymaps from '../utils/Keymaps.js';

export default function KeyboardModule( options ) {

	// DEFAULTS

	if ( !options ) options = {};
	if ( !options.width ) options.width = 1;
	if ( !options.height ) options.height = 0.4;
	if ( !options.margin ) options.margin = 0.003;
	if ( !options.padding ) options.padding = 0.01;

	//

	const keyboard = Object.create( BoxComponent() );

	keyboard.type = 'Keyboard';

	keyboard.currentPanel = 0;

	keyboard.isLowerCase = true;

	keyboard.charsetCount = 1;

	//////////
	// KEYMAP
	//////////

	// ../utils/Keymaps contains information about various keyboard layouts
	// We select one depending on the user's browser language

	let keymap;

	if ( !options.language && navigator ) {

		switch ( navigator.language ) {

			case 'fr' :
				keymap = keymaps.fr
				break

			case 'ru' :
				keyboard.charsetCount = 2;
				keymap = keymaps.ru
				break

			default :
				keymap = keymaps.eng
				break

		};

	} else if ( options.language ) {

		keymap = keymaps[ options.language ];

	} else {

		keymap = keymaps.eng

	};

	////////////////////
	// BLOCKS CREATION
	////////////////////

	// PANELS

	keyboard.keys = [];

	keyboard.panels = keymap.map( (panel, i)=> {

		const lineHeight = (options.height / panel.length) - (options.margin * 2);

		const panelBlock = Block({
			width: options.width + (options.padding * 2),
			height: options.height + (options.padding * 2),
			offset: 0,
			padding: options.padding,
			fontFamily: options.fontFamily,
			fontTexture: options.fontTexture
		});

		panelBlock.charset = 0;

		panelBlock.add( ...panel.map( (line, i, lines)=> {

			const lineBlock = Block({
				width: options.width,
				height: lineHeight,
				margin: options.margin,
				contentDirection: 'row',
				justifyContent: 'center'
			});

			lineBlock.frameContainer.visible = false;

			let keys = [];

			line.forEach( (keyItem)=> {

				const key = Block({
					width: (options.width * keyItem.width) - (options.margin * 2),
					height: lineHeight,
					margin: options.margin,
					justifyContent: 'center',
					fontSize: 0.035,
					offset: 0
				});

				const char = keyItem.chars[ panelBlock.charset ].lowerCase || keyItem.chars[ panelBlock.charset ].icon || "undif";

				key.add(
					Text({
						content: char,
						offset: 0
					})
				);

				key.type = "Key"

				key.info = keyItem;
				key.info.input = char;
				key.panel = panelBlock;

				// line's keys
				keys.push( key );

				// keyboard's keys
				keyboard.keys.push( key );

			});

			lineBlock.add( ...keys )

			return lineBlock

		}))

		return panelBlock

	});

	keyboard.add( keyboard.panels[ 0 ] );

	//

	keyboard.setNextPanel = function setNextPanel() {

		keyboard.panels.forEach( (panel)=> {

			keyboard.remove( panel );

		});

		keyboard.currentPanel = (keyboard.currentPanel + 1) % (keyboard.panels.length);

		keyboard.add( keyboard.panels[ keyboard.currentPanel ] );

		keyboard.update( true, true, true );

	};

	//

	keyboard.setNextCharset = function setNextCharset() {

		keyboard.panels[ keyboard.currentPanel ].charset = ( keyboard.panels[ keyboard.currentPanel ].charset + 1) % keyboard.charsetCount;

		keyboard.keys.forEach( (key)=> {

			// Here we sort the keys, we only keep the ones that are part of the current panel.

			const isInCurrentPanel = keyboard.panels[ keyboard.currentPanel ].getObjectById( key.id );

			if ( !isInCurrentPanel ) return

			//

			const char = key.info.chars[ key.panel.charset ] || key.info.chars[ 0 ];

			const newContent = keyboard.isLowerCase || !char.upperCase ? char.lowerCase : char.upperCase;

			const textComponent = key.children.find( child => child.type === 'Text' );

			key.info.input = newContent;

			textComponent.set({
				content: newContent
			});

			textComponent.update( true, true, true );

		});

	};

	//

	keyboard.toggleCase = function toggleCase() {

		keyboard.isLowerCase = !keyboard.isLowerCase;

		keyboard.keys.forEach( (key)=> {

			const char = key.info.chars[ key.panel.charset ] || key.info.chars[ 0 ];

			const newContent = keyboard.isLowerCase || !char.upperCase ? char.lowerCase : char.upperCase;

			const textComponent = key.children.find( child => child.type === 'Text' );

			key.info.input = newContent;

			textComponent.set({
				content: newContent
			});

			textComponent.update( true, true, true );

		});

	};

	////////////
	//  UPDATE
	////////////

	keyboard.parseParams = function ParseParams() {};

	//

	keyboard.updateLayout = function UpdateLayout() {};

	//

	keyboard.updateInner = function UpdateInner() {};

	// Lastly set the options parameters to this object, which will trigger an update
	keyboard.set( options, true, true );

	return keyboard;

};
