import { TIMEOUT } from 'dns'
import { Context, Schema } from 'koishi'

import {} from 'koishi-plugin-nazrin-core'
import { platform } from 'os'

export const inject = ['nazrin']

export const name = 'nazrin-music-qqmusic'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  const thisPlatform = "qqmusic"
  ctx.nazrin.music.push(thisPlatform)

  ctx.on('nazrin/music', async (ctx, keyword) => {
    let result = await ctx.http.get(`https://api.xingzhige.com/API/QQmusicVIP/?name=${encodeURIComponent(keyword)}`)
    let findList
    if (result.code !== 0) {
      findList = [
        {
          err: true,
          platform: thisPlatform,
        }
      ]
    } else {
      findList = result.data.map((item) => {
        let back = {
          name: item.songname,
          author: item.name,
          cover: item.cover,
          url: item.songurl,
          platform: thisPlatform,
          err: false,
          data: item.mid
        }
        return back
      })
    }

    ctx.emit('nazrin/search_over', findList)
  })

  ctx.on('nazrin/parse_music', async (ctx, platform, url, mid) => {
    if (platform !== thisPlatform) {return}
    let {data} = await ctx.http.get(`https://api.xingzhige.com/API/QQmusicVIP/?mid=${mid}`)
    let second = (+data.interval.slice(0, data.interval.lastIndexOf("分")) * 60) + data.interval.slice(data.interval.lastIndexOf("分") + 1, data.interval.lastIndexOf("秒"))
    ctx.emit('nazrin/parse_over', 
      data.src,
      data.songname,
      data.name,
      data.cover,
      second,
      +data.kbps.slice(0, data.kbps.lastIndexOf(0, "kbps")),
    )
  })
}
