import data from './data';
import * as cheerio from 'cheerio';
import { Artist } from './page';

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

const getSongExampleLyrics = async (artists:Artist[]) => {
    let lyrics = [];
    for (let artist of artists) {
      if(artist.songs.length > 0) {
        for (let song of artist.songs) {
          let result = await searchLyrics(artist.name, song);
          lyrics.push(`Title: ${song} \n\nLyrics: ${await retrieveLyrics(result[0].link)}`)
        }
  
      }else{
        //get a random song
        let result = await getSongsForArtist(artist.name,20);
        const randomNum = Math.floor(Math.random() * result.length - 1);
        lyrics.push(`Title: ${result[randomNum].name} \n\nLyrics: ${await retrieveLyrics(result[randomNum].link)}`)
      }
      
    }
    return lyrics;
  }
  
  const getSongsForArtist = async (artist: string, max_results:number = 3) => {
  
    let result = await searchLyrics(artist, "");
    if(result.length > max_results) {
      result = result.slice(0, max_results);
    }
    let songLinks:{name:string, link:string}[] = [];
    for (let i = 0; i < max_results; i++) {
      songLinks.push({
        name: result[i].title,
        link: result[i].link
      
      });
    }
  
    return songLinks;
    
  }
  
  const test = async () => {
    const lyrics = (await getSongExampleLyrics([
        {
          name: "Sade",
          songs: []
        },
        {
          name: "prince",
          songs: ["little red corvette"]
        
        },
        // {
        //   name: "madonna",
        //   songs: ["vogue"]
        // }
      ])).join("**********");
  }