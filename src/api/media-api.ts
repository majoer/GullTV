import type { MediaResponse } from "../../domain/media";

export async function getMedia(folder: string): Promise<MediaResponse> {
    return (await fetch(`/api/media?folder=${folder}`)).json()
} 