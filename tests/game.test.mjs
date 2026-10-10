import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../server/index.mjs';
test('two clients: secrecy, reveal, stale round, matching and consensual rematch',async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const call=async(path,body,token)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};};
 try {
 const a=(await call('/rooms',{name:'A'})).data;const path='/rooms/'+a.state.code;
 const b=(await call(path+'/join',{name:'B'})).data;
 assert.equal((await call(path+'/join',{name:'C'})).status,400);
 assert.equal((await call(path)).status,401);
 await call(path+'/guess',{round:1,word:'Beach'},a.token);
 const hidden=(await call(path,undefined,b.token)).data;assert.equal(hidden.history.length,0);assert.ok(!JSON.stringify(hidden).includes('beach'));assert.equal(hidden.locked,false);
 assert.equal((await call(path+'/guess',{round:1,word:'other'},a.token)).status,400);
 const revealed=(await call(path+'/guess',{round:1,word:'ocean'},b.token)).data;assert.deepEqual(revealed.history[0].words,['beach','ocean']);
 assert.equal((await call(path+'/guess',{round:1,word:'sun'},a.token)).status,400);
 assert.equal((await call(path+'/guess',{round:2,word:'two words'},a.token)).status,400);
 await call(path+'/guess',{round:2,word:' SUNSET '},a.token);
 assert.equal((await call(path+'/guess',{round:2,word:'sunset'},b.token)).data.won,true);
 await call(path+'/rematch',{},a.token);assert.equal((await call(path,undefined,b.token)).data.won,true);
 const reset=(await call(path+'/rematch',{},b.token)).data;assert.equal(reset.won,false);assert.equal(reset.round,1);
 } finally {await new Promise(resolve=>server.close(resolve));}
});
