import proxy from "./proxy";
import * as cheerio from "cheerio";

export async function scrapeWebPage(
  url: string
  , selector: string = "html"
  ) {
  let result = "error";

  try {
    const data = await fetch(url);
    const text = await data.text()

    const $ = cheerio.load(text);
   // console.log(data.text())
    result = $(selector)
    .html() || 'error'
    .trim()
    //.replaceAll('\n', ' ')
    //.replaceAll(' ','')
     || 'error';
  } catch (error) {
    console.error(error);
  }

  return result;
}

export async function bingSearch(query: string, count: number = 3, offset: number = 0, mkt: string = "en-us", safeSearch: string = "Moderate") {
  if(!process.env.BING_SEARCH_API_ENDPOINT || !process.env.BING_SEARCH_API_KEY) {return "no bing search api key or endpoint"}
  const url = process.env.BING_SEARCH_API_ENDPOINT + `v7.0/search?q=${encodeURI(query)}&count=${count}&offset=${offset}&mkt=${mkt}&safesearch=${safeSearch}`;
  console.log(url);
  //return;
  const options = {
    method: 'GET',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.BING_SEARCH_API_KEY || '',
    }
  };
  
 const response = await fetch(url, options);
  const result = await response.text();
  console.log(result);
  return result;

}

export async function duckDuckGoZero(query: string) {
  if(!process.env.RAPIDAPI_API_KEY || !process.env.RAPIDAPI_HOST) {return "no rapidApi key or host"}

const url = `https://duckduckgo-duckduckgo-zero-click-info.p.rapidapi.com/?q=${encodeURI(query)}&callback=process_duckduckgo&no_html=1&no_redirect=1&skip_disambig=1&format=json`;
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': process.env.RAPIDAPI_API_KEY || '',
    'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || '',
  }
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
  return result;
} catch (error) {
	console.error(error);
  return String(error);
}
}

export async function scrapeWithProxy(url: string) {
  const data = await proxy(url);

  console.log(data.data);
}
