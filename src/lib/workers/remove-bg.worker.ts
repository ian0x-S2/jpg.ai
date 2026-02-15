// src/lib/worker/background-remover.worker.ts
import { pipeline } from '@huggingface/transformers';
import { getComputeDevice } from './device';

let remover: any = null;
let device: 'cpu' | 'webgpu' | 'wasm' = 'wasm';

self.onmessage = async (event) => {
	const imageFile = event.data;

	try {
		// Sends progress message to the main thread

		self.postMessage({ type: 'progress', stage: 'initializing', progress: 40 });

		// Detect compute device and load the pipeline if it has not been loaded yet
		if (!remover) {
			device = await getComputeDevice();
			remover = await pipeline('background-removal', 'briaai/RMBG-1.4', {
				device: device
			});
		}

		// Send progress message
		self.postMessage({ type: 'progress', stage: 'processing', progress: 70 });
		// The 'background-removal' pipeline with this model already returns
		// the image with a transparent background, simplifying everything.
		const outputs = await remover(imageFile);

		// Send progress message
		self.postMessage({ type: 'progress', stage: 'finalizing', progress: 90 });
		const img = outputs[0].rgba();

		// Send the final result (already in the correct RGBA format)
		(self as any).postMessage(
			{
				type: 'complete',
				output: { data: img.data, width: img.width, height: img.height }
			},
			[img.data.buffer]
		);
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		self.postMessage({ type: 'error', error: errorMessage });
	}
};
