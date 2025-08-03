import type { VlcMediaStatus } from "../../domain/vlc-media-status"

export async function getStatus(): Promise<VlcMediaStatus> {
    return (await fetch("/api/vlc/requests/status.json")).json()
}

export async function toggleFullscreen(): Promise<VlcMediaStatus> {
    return (await fetch("/api/vlc/requests/status.json?command=fullscreen")).json()
} 

export async function play(uri: string): Promise<VlcMediaStatus> {
    return (await fetch(`/api/vlc/requests/status.json?command=in_play&input=${uri}`)).json()
} 

export async function pause(): Promise<VlcMediaStatus> {
    return (await fetch(`/api/vlc/requests/status.json?command=pl_forcepause`)).json()
} 

export async function resume(): Promise<VlcMediaStatus> {
    return (await fetch(`/api/vlc/requests/status.json?command=pl_forceresume`)).json()
} 

export async function seek(value: string | number): Promise<VlcMediaStatus> {
    return (await fetch(`/api/vlc/requests/status.json?command=seek&val=${value}`)).json()
} 