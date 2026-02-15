export type ComputeDevice = 'webgpu' | 'wasm';

export async function getComputeDevice(): Promise<ComputeDevice> {
	if (typeof navigator !== 'undefined' && (navigator as any).gpu) {
		try {
			const adapter = await (navigator as any).gpu.requestAdapter();
			if (adapter) {
				return 'webgpu';
			}
		} catch {
			return 'wasm';
		}
	}
	return 'wasm';
}

export function getPipelineOptions(device: ComputeDevice) {
	return device === 'webgpu' ? { device: 'webgpu' as const } : { device: 'cpu' as const };
}
