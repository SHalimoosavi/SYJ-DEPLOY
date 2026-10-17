process.env.SESSION_SECRET='test-session-secret';process.env.MASTER_KEY='test-master-key';process.env.DATA_DIR='/tmp/syj-deploy-csrf-test-data';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const db=require('../core/db');const {createApp}=require('../core/server');
let server;
let base;
let cookie;
let initialToken;

test.before(async()=>{await fs.rm(process.env.DATA_DIR,{recursive:true,force:true});await db.initDB();await db.createUser({username:'csrf-admin',password:'csrf-password-123',role:'admin'});const app=createApp();server=app.listen(0);await new Promise(resolve=>server.once('listening',resolve));base=`http://127.0.0.1:${server.address().port}`});
test.after(async()=>{await new Promise(resolve=>server.close(resolve));await fs.rm(process.env.DATA_DIR,{recursive:true,force:true})});

async function request(path,options={}){const headers=new Headers(options.headers||{});if(cookie)headers.set('cookie',cookie);const response=await fetch(base+path,{...options,headers});const setCookie=response.headers.get('set-cookie');if(setCookie)cookie=setCookie.split(';',1)[0];const body=await response.json().catch(()=>null);return{response,body}};

test('anonymous CSRF bootstrap returns a session-bound token',async()=>{const {response,body}=await request('/api/csrf');assert.equal(response.status,200);assert.equal(typeof body.csrfToken,'string');assert.equal(body.csrfToken.length,64);assert.match(cookie,/connect\.sid=/);initialToken=body.csrfToken});

test('login rejects missing and wrong CSRF tokens',async()=>{const missing=await request('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:'csrf-admin',password:'csrf-password-123'})});assert.equal(missing.response.status,403);const wrong=await request('/api/auth/login',{method:'POST',headers:{'content-type':'application/json','x-csrf-token':'wrong-token'},body:JSON.stringify({username:'csrf-admin',password:'csrf-password-123'})});assert.equal(wrong.response.status,403)});

test('login succeeds with a valid token and rotates the token',async()=>{const login=await request('/api/auth/login',{method:'POST',headers:{'content-type':'application/json','x-csrf-token':initialToken},body:JSON.stringify({username:'csrf-admin',password:'csrf-password-123'})});assert.equal(login.response.status,200);const me=await request('/api/auth/me');assert.equal(me.response.status,200);assert.notEqual(me.body.csrfToken,initialToken);assert.equal(me.body.user.username,'csrf-admin')});

test('state-changing route rejects a request without CSRF',async()=>{const result=await request('/api/apps',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'csrf-test',repoUrl:'https://github.com/example/example.git',branch:'main',startCommand:'npm start'})});assert.equal(result.response.status,403)});

test('setup endpoint also requires the pre-auth CSRF token',async()=>{const result=await request('/api/auth/setup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:'second-admin',password:'another-password-123'})});assert.equal(result.response.status,403)});
