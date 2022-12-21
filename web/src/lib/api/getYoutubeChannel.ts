
import z from 'zod'

const VideoId = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('youtube#video'), videoId: z.string() }),
  z.object({ kind: z.literal('youtube#playlist'), playlistId: z.string() }),
  z.object({ kind: z.literal('youtube#channel'), channelId: z.string() }),
])

const Video = z.object({
  id: VideoId,
  snippet: z.object({
    publishedAt: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnails: z.object({
      high: z.object({
        url: z.string(),
        width: z.number().optional(),
        height: z.number().optional()
      })
    })
  })
})
  .transform(args => ({
    id: args.id.kind == 'youtube#video' ? args.id.videoId : args.id.kind === 'youtube#playlist' ? args.id.playlistId : args.id.channelId,
    kind: args.id.kind,
    title: args.snippet.title,
    publishedAt: args.snippet.publishedAt,
    description: args.snippet.description,
    thumb: args.snippet.thumbnails.high
  }))

export const Videos = z.array(Video)

const API_KEY = process.env.YOUTUBE_API_KEY
export async function getVideos() {
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=UChYjCtGvtgzh7HvJuanV1-g&part=snippet,id&order=date&maxResults=100`)
    const data = await res.json().then(r => {
      return Videos.parse(r.items)
    })
    return data.filter(item => item.kind === 'youtube#video')
  } catch (e) {
    console.error(e)
    return []
  }
}

