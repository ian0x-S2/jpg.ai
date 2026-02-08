<script lang="ts">
	interface Props {
		onFileSelect: (file: File) => void;
		disabled?: boolean;
	}

	let { onFileSelect, disabled = false }: Props = $props();

	let isDragging = $state(false);
	let inputRef: HTMLInputElement;

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const files = e.dataTransfer?.files;
		if (files && files[0]) {
			const file = files[0];
			if (file.type.startsWith('image/')) {
				onFileSelect(file);
			}
		}
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			onFileSelect(file);
		}
	}

	function handleClick() {
		if (!disabled) {
			inputRef?.click();
		}
	}
</script>

<div
	class="relative border border-white/20 bg-black p-16 text-center cursor-pointer transition-all duration-300 font-mono group hover:border-white hover:bg-white/5 {isDragging
		? '!border-white !bg-white/10'
		: ''} {disabled ? 'opacity-20 cursor-not-allowed' : ''}"
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
	<div class="flex flex-col items-center justify-center gap-6">
		<div class="w-12 h-12 border border-white/20 flex items-center justify-center group-hover:border-white transition-colors">
			<span class="text-white text-2xl font-light">+</span>
		</div>
		<div class="flex flex-col gap-2">
			<span class="text-white text-[10px] tracking-[0.3em] uppercase font-bold">
				{isDragging ? 'RELEASE_TO_UPLOAD' : 'PUSH_IMAGE_TO_BUFFER'}
			</span>
			<span class="text-white/40 text-[9px] tracking-[0.2em] uppercase">
				DRAG_AND_DROP_OR_CLICK_INTERFACE
			</span>
		</div>
	</div>
	<div class="absolute bottom-4 left-0 right-0 text-white/20 text-[8px] tracking-[0.4em] uppercase">
		SYS.SPEC: [PNG_JPG_WEBP] [MAX_10MB]
	</div>
</div>

<input
	bind:this={inputRef}
	type="file"
	accept="image/*"
	onchange={handleFileSelect}
	class="hidden"
/>
