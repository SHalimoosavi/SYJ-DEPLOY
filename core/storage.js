const fs=require('node:fs/promises');const path=require('node:path');const {cfg}=require('./config');const CURRENT_SCHEMA=2;let writeChain=Promise.resolve();const DEFAULT={schemaVersion:CURRENT_SCHEMA,users:[],apps:[],deployments:[],audit:[]};
async function file(){await fs.mkdir(cfg.dataDir,{recursive:true});return path.join(cfg.dataDir,'db.json')}async function backup(i){return path.join(cfg.dataDir,`db.json.bak${i}`)}
function migrate(data){const db={...DEFAULT,...data};for(const k of ['users','apps','deployments','audit'])if(!Array.isArray(db[k]))db[k]=[];for(const a of db.apps){if(!a.releaseIds)a.releaseIds=[];if(a.autoRestart==null)a.autoRestart=true;if(a.restartCount==null)a.restartCount=0;if(!a.ownerId) a.ownerId=db.users[0]?.id||null}db.schemaVersion=CURRENT_SCHEMA;return db}
async function parse(p){return migrate(JSON.parse(await fs.readFile(p,'utf8')))}
async function atomicWrite(data){const p=await file();const tmp=`${p}.tmp-${process.pid}-${Date.now()}`;await fs.writeFile(tmp,JSON.stringify(migrate(data),null,2),{mode:0o600});for(let i=3;i>=1;i--){const src=i===1?p:await backup(i-1);const dst=await backup(i);try{await fs.rename(src,dst)}catch{}}await fs.rename(tmp,p)}
async function recover(){for(let i=1;i<=3;i++){try{const db=await parse(await backup(i));await atomicWrite(db);return db}catch{}}return {...DEFAULT}}
async function read(){const p=await file();try{return await parse(p)}catch{return recover()}}
async function write(data){writeChain=writeChain.then(()=>atomicWrite(data));return writeChain}
async function update(mutator){let result;writeChain=writeChain.then(async()=>{const db=await read();result=await mutator(db);await atomicWrite(db)});await writeChain;return result}
async function init(){const p=await file();try{await parse(p)}catch{await atomicWrite(DEFAULT)}}module.exports={init,read,write,update,atomicWrite,CURRENT_SCHEMA};
