<?php
/**
 * Settings page view.
 *
 * Variables expected from controller scope:
 * - bool                              $settings_updated
 * - Photo_Collage_Uninstall_Preference $current_preference
 * - bool                              $release_channel_feature_enabled
 * - Photo_Collage_Release_Channel|null $current_release_channel
 * - int                               $block_count
 * - string                            $export_url
 * - int                               $legacy_auto_height_count
 * - string                            $recompute_url
 * - array{posts_updated:int,blocks_updated:int,posts_scanned:int,errors:int}|null $recompute_result
 *
 * @package PhotoCollage
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="wrap">
	<h1><?php esc_html_e( 'Photo Collage Settings', 'photo-collage' ); ?></h1>

	<?php if ( $settings_updated ) : ?>
		<div class="notice notice-success is-dismissible">
			<p><?php esc_html_e( 'Settings saved successfully.', 'photo-collage' ); ?></p>
		</div>
	<?php endif; ?>

	<?php if ( null !== $recompute_result ) : ?>
		<?php $notice_class = $recompute_result['blocks_updated'] > 0 ? 'notice-success' : 'notice-info'; ?>
		<div class="notice <?php echo esc_attr( $notice_class ); ?> is-dismissible">
			<p>
				<?php
				printf(
					/* translators: 1: number of updated blocks, 2: number of updated posts, 3: number of scanned posts */
					esc_html__( 'Legacy auto-height recompute complete: %1$d blocks updated across %2$d posts (scanned %3$d posts).', 'photo-collage' ),
					absint( $recompute_result['blocks_updated'] ),
					absint( $recompute_result['posts_updated'] ),
					absint( $recompute_result['posts_scanned'] )
				);
				?>
			</p>
			<?php if ( $recompute_result['errors'] > 0 ) : ?>
				<p>
					<?php
					printf(
						/* translators: %d: number of post update errors */
						esc_html__( 'Some posts could not be updated (%d errors).', 'photo-collage' ),
						absint( $recompute_result['errors'] )
					);
					?>
				</p>
			<?php endif; ?>
		</div>
	<?php endif; ?>

	<p class="description">
		<?php esc_html_e( 'Manage plugin updates, content tools, and uninstall behavior.', 'photo-collage' ); ?>
	</p>

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

		<table class="form-table" role="presentation">
			<?php if ( $release_channel_feature_enabled && null !== $current_release_channel ) : ?>
				<tr>
					<th scope="row">
						<?php esc_html_e( 'Release Channel', 'photo-collage' ); ?>
					</th>
					<td>
						<fieldset>
							<legend class="screen-reader-text">
								<span><?php esc_html_e( 'Choose release channel', 'photo-collage' ); ?></span>
							</legend>

							<label>
								<input type="radio" name="<?php echo esc_attr( Photo_Collage_Admin_Settings::RELEASE_CHANNEL_OPTION_NAME ); ?>"
									value="<?php echo esc_attr( Photo_Collage_Release_Channel::STABLE->value ); ?>"
									<?php checked( $current_release_channel->value, Photo_Collage_Release_Channel::STABLE->value ); ?>>
								<strong><?php esc_html_e( 'Stable (WordPress.org)', 'photo-collage' ); ?></strong>
								<p class="description">
									<?php esc_html_e( 'Use production releases from WordPress.org.', 'photo-collage' ); ?>
								</p>
							</label>

							<br>

							<label>
								<input type="radio" name="<?php echo esc_attr( Photo_Collage_Admin_Settings::RELEASE_CHANNEL_OPTION_NAME ); ?>"
									value="<?php echo esc_attr( Photo_Collage_Release_Channel::BETA->value ); ?>"
									<?php checked( $current_release_channel->value, Photo_Collage_Release_Channel::BETA->value ); ?>>
								<strong><?php esc_html_e( 'Beta (GitHub prereleases)', 'photo-collage' ); ?></strong>
								<p class="description">
									<?php esc_html_e( 'Use prerelease builds to test new features. May be unstable.', 'photo-collage' ); ?>
								</p>
							</label>
						</fieldset>
					</td>
				</tr>
			<?php endif; ?>

			<tr>
				<th scope="row">
					<?php esc_html_e( 'On Uninstall', 'photo-collage' ); ?>
				</th>
				<td>
					<fieldset>
						<legend class="screen-reader-text">
							<span><?php esc_html_e( 'Choose uninstall behavior', 'photo-collage' ); ?></span>
						</legend>

						<label>
							<input type="radio" name="<?php echo esc_attr( Photo_Collage_Admin_Settings::OPTION_NAME ); ?>"
								value="<?php echo esc_attr( Photo_Collage_Uninstall_Preference::STATIC_HTML->value ); ?>"
								<?php checked( $current_preference->value, Photo_Collage_Uninstall_Preference::STATIC_HTML->value ); ?>>
							<strong><?php esc_html_e( 'Convert to Static HTML (Recommended)', 'photo-collage' ); ?></strong>
							<p class="description">
								<?php esc_html_e( 'Keeps the current visual layout. Collages are no longer block-editable after conversion.', 'photo-collage' ); ?>
							</p>
						</label>

						<br>

						<label>
							<input type="radio" name="<?php echo esc_attr( Photo_Collage_Admin_Settings::OPTION_NAME ); ?>"
								value="<?php echo esc_attr( Photo_Collage_Uninstall_Preference::CORE_BLOCKS->value ); ?>"
								<?php checked( $current_preference->value, Photo_Collage_Uninstall_Preference::CORE_BLOCKS->value ); ?>>
							<strong><?php esc_html_e( 'Convert to Core Image Blocks', 'photo-collage' ); ?></strong>
							<p class="description">
								<?php esc_html_e( 'Keeps images editable but removes advanced collage positioning and layout.', 'photo-collage' ); ?>
							</p>
						</label>

						<br>

						<label>
							<input type="radio" name="<?php echo esc_attr( Photo_Collage_Admin_Settings::OPTION_NAME ); ?>"
								value="<?php echo esc_attr( Photo_Collage_Uninstall_Preference::KEEP_AS_IS->value ); ?>"
								<?php checked( $current_preference->value, Photo_Collage_Uninstall_Preference::KEEP_AS_IS->value ); ?>>
							<strong><?php esc_html_e( 'Keep As-Is (Reversible)', 'photo-collage' ); ?></strong>
							<p class="description">
								<?php esc_html_e( 'Does not convert blocks. Collages will not display until the plugin is installed again.', 'photo-collage' ); ?>
							</p>
						</label>
					</fieldset>
				</td>
			</tr>
		</table>

		<?php submit_button( __( 'Save Settings', 'photo-collage' ) ); ?>
	</form>

	<?php if ( $block_count > 0 ) : ?>
		<h2><?php esc_html_e( 'Collage Data', 'photo-collage' ); ?></h2>
		<p><?php esc_html_e( 'Export collage data as JSON for backup or migration.', 'photo-collage' ); ?></p>
		<a href="<?php echo esc_url( $export_url ); ?>" class="button button-secondary">
			<?php esc_html_e( 'Export Collage Data (JSON)', 'photo-collage' ); ?>
		</a>

		<h2><?php esc_html_e( 'Legacy Auto Height', 'photo-collage' ); ?></h2>
		<p>
			<?php esc_html_e( 'Recompute legacy auto-height blocks to remove stale hint metadata and normalize current auto-height behavior.', 'photo-collage' ); ?>
		</p>
		<p>
			<strong><?php esc_html_e( 'Blocks requiring recompute:', 'photo-collage' ); ?></strong>
			<?php echo esc_html( (string) absint( $legacy_auto_height_count ) ); ?>
		</p>
		<a
			href="<?php echo esc_url( $recompute_url ); ?>"
			class="button button-secondary<?php echo 0 === $legacy_auto_height_count ? ' disabled' : ''; ?>"
			<?php echo 0 === $legacy_auto_height_count ? 'aria-disabled="true"' : ''; ?>
		>
			<?php esc_html_e( 'Recompute Legacy Auto-Height Blocks', 'photo-collage' ); ?>
		</a>
	<?php endif; ?>
</div>
