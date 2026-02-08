import { pipeline } from '@huggingface/transformers';

let upscaler: any = null;

self.onmessage = async (event) => {
	const image = event.data;

	try {
		self.postMessage({ type: 'progress', stage: 'initializing', progress: 40 });

		if (!upscaler) {
			upscaler = await pipeline('image-to-image', 'Xenova/2x_APISR_RRDB_GAN_generator-onnx');
		}

		self.postMessage({ type: 'progress', stage: 'processing', progress: 70 });

		// If the input is a File/Blob, we can pass it directly or convert to RawImage
		const output = await upscaler(image);

		self.postMessage({ type: 'progress', stage: 'finalizing', progress: 90 });

		// Ensure we send back the pixel data in RGBA format
		const img = (Array.isArray(output) ? output[0] : output).rgba();

		(self as any).postMessage(
			{
				type: 'complete',
				output: {
					data: img.data,
					width: img.width,
					height: img.height
				}
			},
			[img.data.buffer]
		);
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		self.postMessage({ type: 'error', error: errorMessage });
	}
};
