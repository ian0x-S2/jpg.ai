<script lang="ts">
	import ImageUploader from '$lib/components/ImageUploader.svelte';
	import TerminalProgress from '$lib/components/TerminalProgress.svelte';

	// State
	let selectedFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let resultUrl = $state<string | null>(null);
	let resultBlob = $state<Blob | null>(null);
	let isProcessing = $state(false);
	let currentOperation = $state<'remove-bg' | 'upscale' | null>(null);
	let progressStage = $state('initializing');
	let progressValue = $state(0);
	let error = $state<string | null>(null);
	let currentDevice = $state<'webgpu' | 'cpu' | null>(null);

	let removeBgWorker: Worker | null = null;
	let upscaleWorker: Worker | null = null;

	function handleFileSelect(file: File) {
		selectedFile = file;
		previewUrl = URL.createObjectURL(file);
		resultUrl = null;
		resultBlob = null;
		error = null;
	}

	function handleWorkerMessage(operation: 'remove-bg' | 'upscale') {
		return (e: MessageEvent) => {
			const data = e.data;

			if (data.type === 'progress') {
				progressStage = data.stage;
				progressValue = data.progress;
			} else if (data.type === 'device') {
				currentDevice = data.device;
			} else if (data.type === 'complete') {
				// Convert ImageData to PNG blob (Common for both operations now)
				const canvas = document.createElement('canvas');
				canvas.width = data.output.width;
				canvas.height = data.output.height;
				const ctx = canvas.getContext('2d')!;
				
				// Transformers.js returns Uint8Array, but ImageData requires Uint8ClampedArray
				const pixelData = new Uint8ClampedArray(data.output.data.buffer || data.output.data);
				
				ctx.putImageData(
					new ImageData(pixelData, data.output.width, data.output.height),
					0,
					0
				);
				canvas.toBlob((blob) => {
					if (blob) {
						resultBlob = blob;
						resultUrl = URL.createObjectURL(blob);
					}
				}, 'image/png');

				isProcessing = false;
				currentOperation = null;
				progressValue = 100;
			} else if (data.type === 'error') {
				error = data.error;
				isProcessing = false;
				currentOperation = null;
			}
		};
	}

	async function processImage(operation: 'remove-bg' | 'upscale') {
		if (!selectedFile) return;

		isProcessing = true;
		currentOperation = operation;
		error = null;
		progressStage = 'initializing';
		progressValue = 0;
		resultUrl = null;

		if (operation === 'remove-bg') {
			if (!removeBgWorker) {
				removeBgWorker = new Worker(new URL('$lib/workers/remove-bg.worker.ts', import.meta.url), {
					type: 'module'
				});
			}
			removeBgWorker.onmessage = handleWorkerMessage('remove-bg');
			removeBgWorker.postMessage(selectedFile);
		} else {
			if (!upscaleWorker) {
				upscaleWorker = new Worker(new URL('$lib/workers/upscale.worker.ts', import.meta.url), {
					type: 'module'
				});
			}
			upscaleWorker.onmessage = handleWorkerMessage('upscale');
			upscaleWorker.postMessage(selectedFile);
		}
	}

	function downloadResult() {
		if (!resultBlob) return;

		const url = URL.createObjectURL(resultBlob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `processed_${Date.now()}.png`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function reset() {
		selectedFile = null;
		previewUrl = null;
		resultUrl = null;
		resultBlob = null;
		isProcessing = false;
		currentOperation = null;
		error = null;
		progressValue = 0;
		currentDevice = null;

		removeBgWorker?.terminate();
		upscaleWorker?.terminate();
		removeBgWorker = null;
		upscaleWorker = null;
	}

	const operationLabels: Record<string, string> = {
		'remove-bg': 'REMOVE_BACKGROUND',
		upscale: 'UPSCALE_2X'
	};
</script>

<div
	class="relative flex h-screen flex-col overflow-hidden border border-[#222] bg-black font-mono text-white selection:bg-white selection:text-black"
>
	<!-- CRT Overlay (Grayscale) -->
	<div
		class="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_3px] opacity-30"
	></div>

	<header class="border-b border-white bg-black">
		<div class="flex items-center justify-between bg-white px-2 py-1 font-bold text-black">
			<span class="text-xs tracking-[0.2em] uppercase">JPG.AI</span>
			<div class="flex gap-4">
				<span class="cursor-default">[ _ ]</span>
				<span class="flex cursor-default items-center justify-center text-xs"> [ □ ] </span>
				<button
					class="px-2 font-bold transition-colors hover:bg-black hover:text-white"
					onclick={reset}>[ X ]</button
				>
			</div>
		</div>
		<nav class="flex gap-6 px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase">
			<span class="cursor-pointer underline decoration-1 underline-offset-4">01.FILE</span>
			<a href="/help" class="cursor-pointer opacity-40 hover:underline hover:opacity-100">02.HELP</a>
		</nav>
	</header>

	<main class="relative flex-1 overflow-y-auto bg-black p-6">
		{#if !selectedFile}
			<div class="mx-auto mt-12 max-w-3xl text-center">
				<pre
					class="mb-12 text-[min(1.2vw,0.7rem)] leading-[1.1] whitespace-pre text-white opacity-90">
      ██╗██████╗  ██████╗      █████╗ ██╗
      ██║██╔══██╗██╔════╝     ██╔══██╗██║
      ██║██████╔╝██║  ███╗    ███████║██║
 ██   ██║██╔═══╝ ██║   ██║    ██╔══██║██║
 ╚█████╔╝██║     ╚██████╔╝    ██║  ██║██║
  ╚════╝ ╚═╝      ╚═════╝     ╚═╝  ╚═╝╚═╝
                &gt;&gt; NEURAL IMAGE INTERFACE &lt;&lt;</pre>
				<div
					class="mb-10 inline-block border border-white/20 bg-white/5 px-12 py-4 backdrop-blur-sm"
				>
					<p class="mb-1 text-[10px] tracking-widest opacity-60">STATUS: [ LOCAL_NODE_ACTIVE ]</p>
					<p class="text-[10px] tracking-widest">ENCRYPTION: [ AES_256_STRICT ]</p>
				</div>
				<ImageUploader onFileSelect={handleFileSelect} disabled={isProcessing} />
			</div>
		{:else}
			<div class="flex h-full flex-col gap-6">
				<div
					class="flex items-center gap-4 border border-white/20 bg-white/5 px-4 py-3 text-[10px] tracking-widest uppercase"
				>
					<span class="opacity-40">PATH:</span>
					<span class="font-bold text-white">~/ROOT/IMAGES/{selectedFile.name}</span>
					<span class="ml-auto opacity-40"
						>SIZE: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span
					>
				</div>

				<div class="grid min-h-0 flex-1 grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
					<div
						class="flex flex-col overflow-hidden border border-white bg-black shadow-[10px_10px_0_rgba(255,255,255,0.05)]"
					>
						<div
							class="bg-white px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-black uppercase"
						>
							{resultUrl ? 'STORAGE_BUFFER_OUT' : 'STORAGE_BUFFER_IN'}
						</div>
						<div class="flex flex-1 items-center justify-center overflow-hidden bg-[#080808] p-8">
							{#if resultUrl}
								<img
									src={resultUrl}
									alt="Processed"
									class="max-h-full max-w-full border border-white/10 shadow-2xl [image-rendering:pixelated]"
								/>
							{:else}
								<img
									src={previewUrl}
									alt="Original"
									class="max-h-full max-w-full border border-white/10 [image-rendering:pixelated]"
								/>
							{/if}
						</div>
					</div>

					<div
						class="flex flex-col border border-white bg-black shadow-[10px_10px_0_rgba(255,255,255,0.05)]"
					>
						<div
							class="bg-white px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-black uppercase"
						>
							OPERATIONS
						</div>
						<div class="flex flex-col gap-4 p-5">
							{#if isProcessing}
								<TerminalProgress
									stage={progressStage}
									progress={progressValue}
									operation={operationLabels[currentOperation || '']}
								/>
							{:else if error}
								<div class="border border-white bg-white p-5 text-black">
									<div class="mb-2 text-center text-xs font-bold tracking-widest uppercase">
										!! SYSTEM_HALT !!
									</div>
									<div class="mb-6 text-[10px] leading-relaxed opacity-80">{error}</div>

									<button
										class="w-full bg-black py-3 text-[10px] font-bold tracking-[0.2em] text-white uppercase transition-all hover:invert"
										onclick={reset}
									>
										REBOOT_KERNEL
									</button>
								</div>
							{:else if resultUrl}
								<button
									class="flex w-full items-center justify-between bg-white p-4 text-left text-[10px] font-bold tracking-[0.2em] text-black uppercase transition-all hover:bg-neutral-200"
									onclick={downloadResult}
								>
									<span>01.COMMIT_RESULT</span>
									<span>[SAVE]</span>
								</button>
								<button
									class="flex w-full items-center justify-between border border-white p-4 text-left text-[10px] font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-white hover:text-black"
									onclick={reset}
								>
									<span>02.FLUSH_BUFFER</span>
									<span>[NEW]</span>
								</button>
							{:else}
								<button
									class="group flex w-full items-center justify-between bg-white p-4 text-left text-[10px] font-bold tracking-[0.2em] text-black uppercase transition-all hover:bg-neutral-200"
									onclick={() => processImage('remove-bg')}
								>
									<span>01.STRIP_LAYER_ALPHA</span>
									<span class="opacity-0 group-hover:opacity-100">[EXEC]</span>
								</button>
								<button
									class="group flex w-full items-center justify-between bg-white p-4 text-left text-[10px] font-bold tracking-[0.2em] text-black uppercase transition-all hover:bg-neutral-200"
									onclick={() => processImage('upscale')}
								>
									<span>02.SCALE_ARRAY_2X</span>
									<span class="opacity-0 group-hover:opacity-100">[EXEC]</span>
								</button>
								<div class="mt-4 border-t border-white/10 pt-4">
									<button
										class="flex w-full items-center justify-between p-4 text-left text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase transition-all hover:text-white"
										onclick={reset}
									>
										<span>03.ABORT_SESSION</span>
										<span>[ESC]</span>
									</button>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</main>

	<footer
		class="flex justify-between bg-white px-3 py-1 text-[9px] font-bold tracking-[0.1em] text-black uppercase"
	>
		<div class="flex gap-6">
			<span><span class="opacity-40">F1</span> HELP</span>
			<span><span class="opacity-40">F10</span> EXIT</span>
		</div>
		<div class="flex gap-6">
			<span>PROCESSOR: {currentOperation ? '[ BUSY ]' : '[ IDLE ]'}</span>
			<span class="opacity-40">|</span>
			<span>CORE: {currentDevice?.toUpperCase() ?? 'AUTO'}</span>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
		background-color: black;
	}
</style>
