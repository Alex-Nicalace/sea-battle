import svgSprite from "gulp-svg-sprite";
export const sprite = () => {
	return app.gulp.src(`${app.path.src.svgicons}`, {})
		.pipe(app.plugins.plumber(
			app.plugins.notify.onError({
				title: "SVG",
				message: "Error: <%= error.message %>"
			}))
		)
		.pipe(svgSprite({
			mode: {
				symbol: {
					sprite: '../img/icons/sprite.svg',
					//example: true
				}
			},
			shape: {
				id: {
					separator: '',
					// generator: 'svg-'
					generator: ''
				},
				transform: [
					{
						svgo: {
							plugins: [
								{ removeXMLNS: true },
								{ convertPathData: false },
								{ removeViewBox: false },
								// взял с https://siteok.org/blog/html/svg-sprajty
								{ removeUnusedNS: false },
								{ removeUselessStrokeAndFill: true },
								{ cleanupIDs: false },
								{ removeComments: true },
								{ removeEmptyAttrs: true },
								{ removeEmptyText: true },
								{ collapseGroups: true },
								{ removeAttrs: { attrs: '(fill|stroke|style)' } }
							]
						}
					}
				]
			},
			svg: {
				rootAttributes: {
					style: 'display: none;',
					'aria-hidden': true
				},
				xmlDeclaration: false
			}
		}))
		.pipe(app.gulp.dest(`${app.path.srcFolder}`));
}