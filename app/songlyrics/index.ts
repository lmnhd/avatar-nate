import data from './data';
import * as cheerio from 'cheerio';

export async function searchLyrics(artist: string = 'en-vogue', song: string = 'free your mind') {
    const url = `https://www.songlyrics.com/index.php?section=search&searchW=${replaceSpacesWithPlus(song)}+by+${artist}&submit=Search`
    const result = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    
    })

    const text = await result.text()
    const $ = cheerio.load(text)
    const results = $('.serpresult')

    if (results.length === 0) {
        return []
    }

    const parsedResults:{title:string, link:string}[] = []
    results.each((index, element) => {
        const title = $(element).children('a').attr('title') || ''
        const link = $(element).children('a').attr('href') || ''
        if(title && link){
            parsedResults.push({ title, link })
        }
        
    })

    
    console.log('url = ', url, 'results = ', results.length, 'parsedResults = ', parsedResults)

    await new Promise((resolve) => setTimeout(resolve, 5000))

    return parsedResults

    
}

export async function retrieveLyrics(
    url: string = `https://www.songlyrics.com/en-vogue/don-t-go-lyrics/`
    ) {
    const result = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    
    })

    const text = await result.text()
    const $ = cheerio.load(text)
    const lyrics = $('[id=songLyricsDiv]')
    console.log('lyrics = ', lyrics.text())
    const lyricsText = lyrics.text()
    if(lyricsText.includes('We do not have the lyrics for')){
        return ''
    }
    return lyricsText

}

function replaceSpacesWithPlus(str: string) {
    const result = str.replace(/\s/g, '+')
    if (result.charAt(result.length - 1) === '+') {
        return result.slice(0, -1)
    }
    return result
}