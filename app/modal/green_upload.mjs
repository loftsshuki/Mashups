// Runs only inside the private worker image; stdout is captured by its caller.
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { put } from '@vercel/blob'
const [file,pathname]=process.argv.slice(2)
const token=process.env.GREEN_ROOM_READ_WRITE_TOKEN ?? process.env.GREEN_ROOM_BLOB_READ_WRITE_TOKEN
if(!file || !pathname?.startsWith('green-room/jobs/') || pathname.includes('..') || !token)throw new Error('Private upload configuration invalid')
const {size}=await stat(file)
if(size<1 || size>512*1024*1024)throw new Error('Invalid worker output size')
const hash=createHash('sha256');for await(const chunk of createReadStream(file))hash.update(chunk)
const blob=await put(pathname,createReadStream(file),{access:'private',token,contentType:'audio/wav',addRandomSuffix:false,allowOverwrite:false})
console.log(JSON.stringify({blobUrl:blob.url,blobPathname:blob.pathname,contentType:'audio/wav',byteSize:size,sha256:hash.digest('hex')}))
