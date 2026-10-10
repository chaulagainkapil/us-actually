import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { submit, view, voteRematch } from '../src/engine.mjs';
export function createServer() {
 const rooms = new Map();
 const rates = new Map();
 const cleanup = setInterval(() => { const now = Date.now(); for (const [code,r] of rooms) if (now-r.updated > 3600000) rooms.delete(code); rates.clear(); },60000).unref();
 const server = http.createServer(async (req,res) => {
  res.setHeader('Content-Type','application/json'); res.setHeader('Access-Control-Allow-Origin',process.env.ALLOWED_ORIGIN || '*'); res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization'); res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  if(req.method === 'OPTIONS') {res.writeHead(204);res.end();return;}
  try {
   const ip = req.socket.remoteAddress; const hits = (rates.get(ip)||0)+1; rates.set(ip,hits); if(hits>600) throw new Error('Too many requests. Try again in a minute.');
   const url = new URL(req.url,'http://localhost'); let body={};
   if(req.method==='POST') { let data=''; for await(const chunk of req) {data+=chunk; if(data.length>2048) throw new Error('Request too large.');} body=JSON.parse(data||'{}'); }
   const name = () => {if(typeof body.name!=='string'|| !body.name.trim() || body.name.trim().length>24) throw new Error('Enter a name, up to 24 characters.');return body.name.trim();};
   if(url.pathname==='/rooms'&&req.method==='POST') {
    if(rooms.size>=10000) throw new Error('Server is busy. Try later.');
    let code; do {code=randomBytes(4).toString('hex').slice(0,6).toUpperCase();} while(rooms.has(code));
    const token=randomBytes(24).toString('hex'); const r={code,players:[{token,name:name()}],guesses:{},history:[],won:false,votes:[],updated:Date.now()};rooms.set(code,r);res.end(JSON.stringify({token,state:view(r,token)}));return;
   }
   const match=url.pathname.match(/^\/rooms\/([A-F0-9]{6})(?:\/(join|guess|rematch))?$/); if(!match) throw new Error('Unknown endpoint.');
   const r=rooms.get(match[1]); if(!r) throw new Error('Room not found or expired.');
   if(match[2]==='join'&&req.method==='POST') {if(r.players.length>=2) throw new Error('This room already has two players.'); const token=randomBytes(24).toString('hex');r.players.push({token,name:name()});r.updated=Date.now();res.end(JSON.stringify({token,state:view(r,token)}));return;}
   const token=req.headers.authorization?.replace(/^Bearer /,'');if(!r.players.some(p=>p.token===token)) {res.writeHead(401);res.end(JSON.stringify({error:'Session not recognized.'}));return;}
   if(match[2]==='guess'&&req.method==='POST') submit(r,token,body.round,body.word);
   else if(match[2]==='rematch'&&req.method==='POST') voteRematch(r,token);
   else if(match[2] || req.method!=='GET') throw new Error('Unknown endpoint.');
   r.updated=Date.now();res.end(JSON.stringify(view(r,token)));
  } catch(e) {res.writeHead(400);res.end(JSON.stringify({error:e.message||'Request failed.'}));}
 });
 server.on('close',()=>clearInterval(cleanup));return server;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) createServer().listen(Number(process.env.PORT)||8787,'0.0.0.0',()=>console.log('insync server listening on port '+(process.env.PORT||8787)));
