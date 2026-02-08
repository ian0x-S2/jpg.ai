<div class="h-full flex flex-col p-6 font-mono text-white bg-black">
	<div class="border border-white p-6 shadow-[10px_10px_0_rgba(255,255,255,0.05)]">
		<h1 class="text-xl font-bold mb-6 bg-white text-black px-2 inline-block">SYSTEM_MANUAL_V1.0</h1>
		
		<div class="space-y-8">
			<section>
				<h2 class="text-sm font-bold border-b border-white/20 pb-1 mb-4 opacity-60">01.OVERVIEW</h2>
				<p class="text-xs leading-relaxed">
					This terminal provides a local-first interface for neural image processing. All operations are executed on the client-side using Web-AI acceleration. No data leaves the local node during processing.
				</p>
			</section>

			<section>
				<h2 class="text-sm font-bold border-b border-white/20 pb-1 mb-4 opacity-60">02.CORE_OPERATIONS</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="border border-white/10 p-4">
						<h3 class="text-xs font-bold mb-2">[STRIP_LAYER_ALPHA]</h3>
						<p class="text-[10px] opacity-70 leading-relaxed">
							Utilizes the RMBG-1.4 model to isolate the primary subject and remove background information. Output format: 32-bit RGBA PNG.
						</p>
					</div>
					<div class="border border-white/10 p-4">
						<h3 class="text-xs font-bold mb-2">[SCALE_ARRAY_2X]</h3>
						<p class="text-[10px] opacity-70 leading-relaxed">
							Neural upscaling using RRDB GAN architecture. Increases spatial resolution by 200% while reconstructive details via predictive algorithms.
						</p>
					</div>
				</div>
			</section>

			<section>
				<h2 class="text-sm font-bold border-b border-white/20 pb-1 mb-4 opacity-60">03.SYSTEM_REQUIREMENTS</h2>
				<ul class="text-[10px] space-y-2 opacity-70">
					<li>&gt; BROWSER: MODERN_EVERGREEN (CHROME/FIREFOX/SAFARI)</li>
					<li>&gt; MEMORY: 4GB_MINIMUM</li>
					<li>&gt; ACCELERATION: WEBGPU_ENABLED (OPTIONAL_BUT_RECOMMENDED)</li>
				</ul>
			</section>
		</div>

		<div class="mt-12 pt-6 border-t border-white/20">
			<a href="/" class="inline-block bg-white text-black px-6 py-2 text-xs font-bold hover:invert transition-all">
				RETURN_TO_SHELL
			</a>
		</div>
	</div>
</div>
