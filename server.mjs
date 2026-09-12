import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json'};
createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let path=resolve(root,'.'+pathname);if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}if((await stat(path)).isDirectory())path=resolve(path,'index.html');const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(4173,'0.0.0.0',()=>console.log('Little Local: http://localhost:4173'));
