// app/actions.ts
'use server'
export async function getImageFile() {
    console.log('getImageFile')
  // Your logic to fetch or generate the image data...
  const imageData = new Buffer('sdf') // Replace with your implementation

  // Set the content-type header
  const headers = new Headers();
  headers.set('content-type', 'image/png');

  // Return the image data
  //return new Response(imageData, { headers });
  return {response: imageData}
}