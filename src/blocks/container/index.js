import { registerBlockType } from '@wordpress/blocks';
import { layout } from '@wordpress/icons';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import deprecated from './deprecated';

registerBlockType( metadata, {
	icon: layout,
	edit: Edit,
	save,
	deprecated,
} );
