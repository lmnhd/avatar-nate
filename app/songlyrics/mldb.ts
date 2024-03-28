import * as Cheerio from 'cheerio'
import { Artist } from "./page";

function replaceSpacesWithPlus(str: string) {
    const result = str.replace(/\s/g, '+')
    if (result.charAt(result.length - 1) === '+') {
        return result.slice(0, -1)
    }
    return result
}
export async function searchForSongs(artist:Artist){
    console.log('searching for artist', artist)
    const url = `https://www.mldb.org/search?mq=Bon+Jovi&si=0&mm=0&ob=1`
    const result = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const text = await result.text()
    const $ = Cheerio.load(text)
    const theList = $('[id=thelist]').find('tr')

    theList.each((index, element) => {
        const song = $(element).children('td').eq(1).text()
        console.log('song = ', song)
    })
    console.log(theList.length)
    return theList.length
}