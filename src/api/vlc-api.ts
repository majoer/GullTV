export async function getStatus(): Promise<string> {
    return (await fetch("/vlc")).text()
}

export async function toggleFullscreen(): Promise<string> {
    return (await fetch("/api/vlc/requests/status.json?command=fullscreen")).text()
} 

export async function play(uri: string): Promise<string> {
    return (await fetch(`/api/vlc/requests/status.json?command=in_play&input=${uri}`)).text()
} 