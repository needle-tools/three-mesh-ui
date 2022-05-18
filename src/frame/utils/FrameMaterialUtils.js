import { Vector2, Vector4 } from 'three';

//JSDoc related import
/* eslint-disable no-unused-vars */
import { Material, ShaderMaterial } from 'three';
import { ShaderChunkUI } from 'three-mesh-ui';
/* eslint-enable no-unused-vars */


export default class FrameMaterialUtils {



	/**
	 *
	 * @returns {Object<{m: string, t?: (function((Material|ShaderMaterial), string, *): void)}>}
	 */
	static get frameMaterialProperties() {

		return _frameMaterialProperties;

	}


	/**
	 * Alter a material options with required fontMaterial options and or default values
	 * @param {Object.<string,any>} materialOptions
	 */
	static ensureMaterialOptions( materialOptions ) {
		materialOptions.transparent = true;
		materialOptions.alphaTest = materialOptions.alphaTest || 0.02;
	}

	/**
	 * As three-mesh-ui FontMaterial relies on webgl preprocessors,
	 * lets force the material to have a proper defines object
	 * @param {Material|ShaderMaterial} threeMaterial
	 */
	static ensureDefines( threeMaterial ) {
		if ( !threeMaterial.defines ) {
			threeMaterial.defines = {};
		}
	}

	/* eslint-disable no-unused-vars */
	/**
	 *
	 * @param {Material|ShaderMaterial} threeMaterial
	 * @param {Object.<string,any>} materialOptions
	 */
	static ensureUserData( threeMaterial, materialOptions ) {
		threeMaterial.userData.borderColor = { value: null };
		threeMaterial.userData.borderRadius = { value: new Vector4(0,0,0,0) };
		threeMaterial.userData.borderWidth = { value: new Vector4(0,0,0,0) };
		threeMaterial.userData.borderOpacity = { value: null };
		threeMaterial.userData.frameSize = { value: new Vector2( 1, 1 ) };
		threeMaterial.userData.textureSize = { value: new Vector2( 1, 1 ) };

	}
	/* eslint-enable no-unused-vars */

	/**
	 *
	 * @param {any} shader
	 * @param {Material|ShaderMaterial} threeMaterial
	 */
	static bindUniformsWithUserData( shader, threeMaterial ) {

		shader.uniforms.borderColor = threeMaterial.userData.borderColor;
		shader.uniforms.borderRadius = threeMaterial.userData.borderRadius;
		shader.uniforms.borderWidth = threeMaterial.userData.borderWidth;
		shader.uniforms.borderOpacity = threeMaterial.userData.borderOpacity;
		shader.uniforms.frameSize = threeMaterial.userData.frameSize;
		shader.uniforms.textureSize = threeMaterial.userData.textureSize;
	}

	/**
	 *
	 * @param shader
	 */
	static injectShaderChunks( shader ) {
		FrameMaterialUtils.injectVertexShaderChunks( shader );
		FrameMaterialUtils.injectFragmentShaderChunks( shader );
	}

	/**
	 *
	 * @param shader
	 */
	static injectVertexShaderChunks( shader ) {
		shader.vertexShader = shader.vertexShader.replace(
			'#include <uv_pars_vertex>',
			'#include <uv_pars_vertex>\n' + ShaderChunkUI.frame_border_pars_vertex
		);

		// vertex chunks
		shader.vertexShader = shader.vertexShader.replace(
			'#include <uv_vertex>',
			'#include <uv_vertex>\n' + ShaderChunkUI.frame_border_vertex
		)

	}

	/**
	 *
	 * @param shader
	 */
	static injectFragmentShaderChunks( shader ) {
		shader.fragmentShader = shader.fragmentShader.replace(
			'#include <map_pars_fragment>',
			'#include <map_pars_fragment>\n' + ShaderChunkUI.frame_background_pars_fragment
		)

		shader.fragmentShader = shader.fragmentShader.replace(
			'#include <map_pars_fragment>',
			'#include <map_pars_fragment>\n' + ShaderChunkUI.frame_border_pars_fragment
		)

		shader.fragmentShader = shader.fragmentShader.replace(
			'#include <map_pars_fragment>',
			'#include <map_pars_fragment>\n' + ShaderChunkUI.frame_common_pars
		)

		// fragment chunks
		shader.fragmentShader = shader.fragmentShader.replace(
			'#include <map_fragment>',
			ShaderChunkUI.frame_background_fragment
		)

		shader.fragmentShader = shader.fragmentShader.replace(
			'#include <alphamap_fragment>',
			ShaderChunkUI.frame_border_fragment+'\n#include <alphamap_fragment>'
		)


	}

}


const USE_ALPHATEST = "USE_ALPHATEST";

/**
 *
 * @type {(fontMaterial:Material|ShaderMaterial, materialProperty:string, value:any) => void }
 * @private
 */
const _alphaTestTransformer = function( fontMaterial, materialProperty, value) {


	fontMaterial.alphaTest = value;

	const expectedWebglPreProcessor = value === 0 ? '' : null;
	if( expectedWebglPreProcessor ) {

		if( fontMaterial.defines[USE_ALPHATEST] === undefined ) {

			fontMaterial.defines[USE_ALPHATEST] = ''
			fontMaterial.needsUpdate = true; // recompile with new preprocessor value

		}

	} else if( fontMaterial.defines[USE_ALPHATEST] !== undefined ) {

		delete fontMaterial.defines[USE_ALPHATEST];
		fontMaterial.needsUpdate = true; // recompile without existing preprocessor value

	}

}

const _uniformsOrUserData = function( material, property, value ) {

	if( material.userData[property] ) {

		material.userData[property].value = value;

	}else{

		material.uniforms[property].value = value;

	}

}

const _backgroundSizeTransformer = function( material, property, value ) {

	value = ['stretch','contain','cover'].indexOf(value);
	_toDefine(material, 'BACKGROUND_MAPPING', value);

}

const _toDefine = function( material, property, value ) {

	// abort if nothing to update
	if( material.defines[property] && material.defines[property] === value ) return;

	material.defines[property] = value;
	material.needsUpdate = true;

}

/**
 *
 * @type {Object.<{m:string, t?:(fontMaterial:Material|ShaderMaterial, materialProperty:string, value:any) => void}>}
 */
const _frameMaterialProperties = {
	alphaTest: { m: 'alphaTest', t: _alphaTestTransformer },
	backgroundTexture: { m: 'map' },
	backgroundColor: { m: 'color' },
	backgroundOpacity: { m:'opacity' },
	backgroundSize: { m: 'u_backgroundMapping', t: _backgroundSizeTransformer },
	_borderWidth: { m: 'borderWidth', t: _uniformsOrUserData },
	borderColor: { m: 'borderColor', t: _uniformsOrUserData },
	_borderRadius: { m: 'borderRadius', t: _uniformsOrUserData },
	borderOpacity: { m: 'borderOpacity', t: _uniformsOrUserData },
	size: { m: 'frameSize', t: _uniformsOrUserData },
	tSize: { m: 'textureSize', t: _uniformsOrUserData }
}
