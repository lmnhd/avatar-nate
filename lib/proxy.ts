import Axios, { AxiosResponse } from "axios-https-proxy-fix";
import { writeFile } from "fs";

export default async function(url:string){
    let response:AxiosResponse<any> = {} as AxiosResponse; 
    await Axios
    .get(url, {
      proxy: {
        host: "brd.superproxy.io",
        port: 22225,
        auth: {
          username: process.env.PROXY_USER || '',
          password: process.env.PROXY_PASS || '',
        },
      },
    })
    .then(
      async function (data) {
        //console.log(data);
        response = data;
        //writeFile('test-data.html',await data.data,(err) => console.log(err))
        
      },
      function (err) {
        console.error(err);
        
      }
    );
      return response;
}