<?php
/**
 * Settings page view.
 *
 * Variables expected from controller scope:
 * - bool                              $settings_updated
 * - Photo_Collage_Uninstall_Preference $current_preference
 * - int                               $block_count
 * - string                            $export_url
 *
 * @package PhotoCollage
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="wrap">
	<h1><?php esc_html_e( 'Photo Collage Uninstall Settings', 'photo-collage' ); ?></h1>

	<?php if ( $settings_updated ) : ?>
		<div class="notice notice-success is-dismissible">
			<p><?php esc_html_e( 'Settings saved successfully.', 'photo-collage' ); ?></p>
		</div>
	<?php endif; ?>

	<div class="notice notice-warning">
		<p>
			<strong><?php esc_html_e( 'Important:', 'photo-collage' ); ?></strong>
			<?php esc_html_e( 'When you uninstall this plugin, your collage blocks will be converted based on the option you choose below. This conversion is irreversible.', 'photo-collage' ); ?>
		</p>
	</div>

	<div class="notice notice-info">
		<p>
			<strong><?php esc_html_e( 'Collage Blocks Found:', 'photo-collage' ); ?></strong>
			<?php
			if ( 0 === $block_count ) {
				esc_html_e( 'No collage blocks found in your content.', 'photo-collage' );
			} else {
				/* translators: %d: number of collage blocks */
				printf( esc_html( _n( '%d collage block found', '%d collage blocks found', $block_count, 'photo-collage' ) ), absint( $block_count ) );
			}
			?>
		</p>
	</div>

	<form method="post" action="">
		<?php wp_nonce_field( 'photo_collage_uninstall_options', 'photo_collage_settings_nonce' ); ?>

		<table class="form-table">
			<tr>
				<th scope="row">
					<?php esc_html_e( 'Conversion Method', 'photo-collage' ); ?>
				</th>
				<td>
					<fieldset>
						<legend class="screen-reader-text">
							<span><?php esc_html_e( 'Choose conversion method', 'photo-collage' ); ?></span>
						</legend>

						<label>
							<input type="radio" name="<?php echo esc_attr( Photo_Collage_Admin_Settings::OPTION_NAME ); ?>"
								value="<?php echo esc_attr( Photo_Collage_Uninstall_Preference::STATIC_HTML->value ); ?>"
								<?php checked( $current_preference->value, Photo_Collage_Uninstall_Preference::STATIC_HTML->value ); ?>>
							<strong><?php esc_html_e( 'Convert to Static HTML (Recommended)', 'photo-collage' ); ?></strong>
							<p class="description">
								<?php esc_html_e( 'Preserves the exact visual appearance of your collages including layout, positioning, rotation, and opacity. Blocks will become HTML blocks that cannot be edited visually, but will look exactly the same.', 'photo-collage' ); ?>
							</p>
						</label>

						<br>

						<label>
							<input type="radio" name="<?php echo esc_attr( Photo_Collage_Admin_Settings::OPTION_NAME ); ?>"
								value="<?php echo esc_attr( Photo_Collage_Uninstall_Preference::CORE_BLOCKS->value ); ?>"
								<?php checked( $current_preference->value, Photo_Collage_Uninstall_Preference::CORE_BLOCKS->value ); ?>>
							<strong><?php esc_html_e( 'Convert to Core Image Blocks', 'photo-collage' ); ?></strong>
							<p class="description">
								<?php esc_html_e( 'Converts collages to standard WordPress image blocks inside a group block. Images will be editable but will lose advanced positioning, rotation, z-index, and layout features. Images will stack vertically.', 'photo-collage' ); ?>
							</p>
						</label>

						<br>

						<label>
							<input type="radio" name="<?php echo esc_attr( Photo_Collage_Admin_Settings::OPTION_NAME ); ?>"
								value="<?php echo esc_attr( Photo_Collage_Uninstall_Preference::KEEP_AS_IS->value ); ?>"
								<?php checked( $current_preference->value, Photo_Collage_Uninstall_Preference::KEEP_AS_IS->value ); ?>>
							<strong><?php esc_html_e( 'Keep As-Is (Reversible)', 'photo-collage' ); ?></strong>
							<p class="description">
								<?php esc_html_e( 'Leaves block data intact. Content will not display while the plugin is uninstalled, but will be fully restored if you reinstall the plugin.', 'photo-collage' ); ?>
							</p>
						</label>
					</fieldset>
				</td>
			</tr>
		</table>

		<h2><?php esc_html_e( 'Feature Comparison', 'photo-collage' ); ?></h2>
		<table class="widefat">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Feature', 'photo-collage' ); ?></th>
					<th><?php esc_html_e( 'Static HTML', 'photo-collage' ); ?></th>
					<th><?php esc_html_e( 'Core Image Blocks', 'photo-collage' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><?php esc_html_e( 'Preserves layout', 'photo-collage' ); ?></td>
					<td>✅</td>
					<td>❌</td>
				</tr>
				<tr class="alternate">
					<td><?php esc_html_e( 'Preserves positioning', 'photo-collage' ); ?></td>
					<td>✅</td>
					<td>❌</td>
				</tr>
				<tr>
					<td><?php esc_html_e( 'Preserves rotation', 'photo-collage' ); ?></td>
					<td>✅</td>
					<td>❌</td>
				</tr>
				<tr class="alternate">
					<td><?php esc_html_e( 'Preserves z-index (layering)', 'photo-collage' ); ?></td>
					<td>✅</td>
					<td>❌</td>
				</tr>
				<tr>
					<td><?php esc_html_e( 'Editable after uninstall', 'photo-collage' ); ?></td>
					<td>❌</td>
					<td>✅</td>
				</tr>
				<tr class="alternate">
					<td><?php esc_html_e( 'Image URL preserved', 'photo-collage' ); ?></td>
					<td>✅</td>
					<td>✅</td>
				</tr>
				<tr>
					<td><?php esc_html_e( 'Alt text preserved', 'photo-collage' ); ?></td>
					<td>✅</td>
					<td>✅</td>
				</tr>
				<tr class="alternate">
					<td><?php esc_html_e( 'Caption preserved', 'photo-collage' ); ?></td>
					<td>✅</td>
					<td>✅</td>
				</tr>
			</tbody>
		</table>

		<?php submit_button(); ?>
	</form>

	<?php if ( $block_count > 0 ) : ?>
		<h2><?php esc_html_e( 'Backup Your Data', 'photo-collage' ); ?></h2>
		<p><?php esc_html_e( 'Before uninstalling, we recommend exporting your collage data as a backup.', 'photo-collage' ); ?></p>
		<a href="<?php echo esc_url( $export_url ); ?>" class="button button-secondary">
			<?php esc_html_e( 'Export Collage Data (JSON)', 'photo-collage' ); ?>
		</a>
	<?php endif; ?>
</div>
