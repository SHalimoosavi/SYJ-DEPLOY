const crypto=require('node:crypto');const fs=require('node:fs');const path=require('node:path');const {cfg}=require('./config');const key=crypto.scryptSync(cfg.masterKey,'syj-deploy-v1',32);
function encrypt(value){if(value==null)return null;const iv=crypto.randomBytes(12);const c=crypto.createCipheriv('aes-256-gcm',key,iv);const data=Buffer.concat([c.update(String(value),'utf8'),c.final()]);return `${iv.toString('base64url')}.${c.getAuthTag().toString('base64url')}.${data.toString('base64url')}`}
function decrypt(value){if(!value)return '';const [ivB,tagB,dataB]=String(value).split('.');const d=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(ivB,'base64url'));d.setAuthTag(Buffer.from(tagB,'base64url'));return Buffer.concat([d.update(Buffer.from(dataB,'base64url')),d.final()]).toString('utf8')}
function mask(value){return value?'••••••••':''}function randomSecret(bytes=32){return crypto.randomBytes(bytes).toString('hex')}
function timingSafeEqualHex(a,b){const aa=Buffer.from(a||'');const bb=Buffer.from(b||'');return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb)}
function audit(action,details={}){fs.mkdirSync(cfg.logsDir,{recursive:true});fs.appendFileSync(path.join(cfg.logsDir,'audit.log'),JSON.stringify({at:new Date().toISOString(),action,...details})+'\n',{mode:0o600})}
module.exports={encrypt,decrypt,mask,randomSecret,timingSafeEqualHex,audit};
