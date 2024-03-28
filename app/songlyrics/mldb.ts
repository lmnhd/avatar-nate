import * as Cheerio from 'cheerio'
import { Artist } from "./page";

export async function quickLyrics(artist:string, song:string){
    try {
        const url = `https://www.mldb.org/search?mq=${replaceSpacesWithPlus(artist)} ${replaceSpacesWithPlus(song)}&si=0&mm=0&ob=1`
        const result = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const text = await result.text()
        const $ = Cheerio.load(text)
        const lyrics = $('p.songtext').text();
        if(lyrics === '') {
            console.log('(server) - lyrics blank = ', lyrics)
            return 'empty song. machine error'
        }

        console.log('lyrics = ', lyrics)
        return lyrics
       
        
    } catch (error) {
        return `error: ${error}`
    }
}
export const getRandomSongs = async (artistName: string, numSongs:number = 3) => {
    const songs = await searchForSongs(artistName);
    if(numSongs > songs.length){
      numSongs = songs.length;
    }
    // generate 3 unique random numbers
    const randomNums:number[] = [];
    while (randomNums.length < numSongs) {
      const randomNum = Math.floor(Math.random() * songs.length - 1);
      if (!randomNums.includes(randomNum)) {
        randomNums.push(randomNum);
      }
    }
    const randomSongs = randomNums.map((num) => songs[num]);
    //console.log(randomNums);
    const lyricsResult:{
      name:string,
      lyrics:string,
      artist:string,

    }[] = []
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    for (let i = 0; i < randomSongs.length; i++) {
      const lyrics = await quickLyrics(artistName, randomSongs[i].name);
      console.log(lyrics);
      //TODO: validate lyrics before pushing to array
      if(lyrics === ''){
        continue;
      
      }
      lyricsResult.push({
        name: randomSongs[i].name,
        lyrics: lyrics,
        artist: artistName,
      
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
   
    return lyricsResult;
  };
function replaceSpacesWithPlus(str: string) {
    const result = str.replace(/\s/g, '+')
    if (result.charAt(result.length - 1) === '+') {
        return result.slice(0, -1)
    }
    return result
}
export async function searchForSongs(artist:string): Promise<{name:string,link:string,artist:string,error:any}[] >{
    try {
        console.log('searching for artist', artist)
    const url = `https://www.mldb.org/search?mq=${artist}&si=0&mm=0&ob=1`
    const result = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const text = await result.text()
    const $ = Cheerio.load(text)
    const theList = $('[id=thelist]').find('tr')

    const response:{name:string,link:string,artist:string, error:any}[] = []
    theList.each((index, element) => {
        const song = $(element).children('td').eq(1).text()
        const link = 'https://www.mldb.org/' + $(element).children('td').eq(1).children('a').attr('href')
        const artist = $(element).children('td').eq(0).text()
        response.push({ name:song, link, artist, error: ''})
        //console.log('song = ', name, 'link = ', link, 'artist = ', artist)
    })
    console.log(theList.length)
    return response
    } catch (error) {
        return [{name:'',link:'',artist:'',error:'error'}]
    }
   
}
   


export async function getLyricsFromLink(link:string){
    try {
        const result = await fetch(link, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const text = await result.text()
        const $ = Cheerio.load(text)
        const lyrics = $('p.songtext').text();
        console.log('lyrics = ', lyrics)
        return lyrics
    } catch (error) {
        return error
    }

}

