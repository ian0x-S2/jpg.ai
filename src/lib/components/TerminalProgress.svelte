<script lang="ts">
	interface Props {
		stage: string;
		progress: number;
		operation: string;
	}

	let { stage, progress, operation }: Props = $props();

	const stageLabels: Record<string, string> = {
		initializing: 'LOADING_MODEL',
		processing: 'PROCESSING_IMAGE',
		finalizing: 'FINALIZING'
	};

	const filledBlocks = $derived(Math.floor(progress / 5));
	const progressBar = $derived('█'.repeat(filledBlocks) + '░'.repeat(20 - filledBlocks));
</script>

<div class="bg-black border border-white p-5 font-mono">
	<div class="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
		<span class="text-white text-[10px] font-bold tracking-[0.2em] uppercase">
			EXEC_ID: {operation}
		</span>
		<span class="w-1.5 h-1.5 bg-white animate-pulse"></span>
	</div>

	<div class="flex items-center gap-3 mb-4">
		<span class="text-white opacity-40 text-[10px] tracking-widest uppercase">STATE:</span>
		<span class="text-white text-[10px] font-bold tracking-widest uppercase italic">
			{stageLabels[stage] || stage.toUpperCase()}
		</span>
	</div>

	<div class="flex flex-col gap-2">
		<div class="flex justify-between text-[8px] tracking-[0.3em] uppercase opacity-40">
			<span>ARRAY_PROGRESS</span>
			<span>{Math.round(progress)}%</span>
		</div>
		<div class="flex text-white text-xs tracking-[-0.15em] leading-none select-none">
			<span class="opacity-100">{ '█'.repeat(filledBlocks) }</span>
			<span class="opacity-10">{ '█'.repeat(20 - filledBlocks) }</span>
		</div>
	</div>
</div>
