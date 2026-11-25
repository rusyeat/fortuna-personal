import {readFile,writeFile} from 'node:fs/promises';
const reference=await readFile('../tez-taza-reference.html','utf8').catch(async()=>{const r=await fetch('https://tez-taza.kz/');if(!r.ok)throw new Error(r.status);return r.text();});
const original=await readFile('../fortuna-original.html','utf8').catch(async()=>{const r=await fetch('https://fortunapersonal.tilda.ws/');if(!r.ok)throw new Error(r.status);return r.text();});
function images(html,id){const chunk=html.split(`<div id="rec${id}`)[1]?.split('<div id="rec')[0]||'';return [...new Set([...chunk.matchAll(/(?:data-original|src)=["'](https:\/\/static\.tildacdn\.[^"']+)["']/g)].map(x=>x[1]).filter(u=>!u.includes('.js')&&!u.includes('tildacopy')))];}
const resources={};
function group(html,id,names){const urls=images(html,id);names.forEach((name,i)=>{if(urls[i])resources[name]=urls[i];});}
group(reference,'2275345923',['hero.webp']);
group(reference,'2275328013',['benefit-clean.png','benefit-calendar.png','benefit-quality.png','benefit-visit.png']);
group(reference,'2275972733',['calculator.svg','room-apartment.jpg','room-house.jpg','room-office.jpg']);
group(reference,'2275504333',['service-apartment.png','service-house.jpg','service-office.jpg','service-parking.jpg','service-exterior.jpeg','service-entrance.jpeg','service-commercial.png']);
group(reference,'2275539753',['price-maintenance.jpg','price-general.jpg','price-renovation.jpg']);
group(reference,'2275552743',['extra-windows.svg','extra-sofa.svg','extra-fridge.svg','extra-oven.svg','extra-chair.svg','extra-curtains.svg']);
group(original,'508263610',['work-1.jpeg','work-2.jpeg','work-3.jpeg','work-4.jpeg','work-5.jpeg']);
resources['fortuna-work-1.jpg']='https://i8.photo.2gis.com/images/branch/0/30258560096097457_9af2_656x340.jpg';
resources['fortuna-work-2.jpg']='https://i1.photo.2gis.com/images/branch/0/30258560096097454_18cd_656x340.jpg';
resources['tildasans.woff2']='https://static.tildacdn.com/fonts/tildasans/TildaSans-VF.woff2';
if(process.env.FORTUNA_LOGO_URL)resources['fortuna-logo.jpg']=process.env.FORTUNA_LOGO_URL;
await Promise.all(Object.entries(resources).map(async([name,url])=>{try{const r=await fetch(url);if(!r.ok)throw new Error(r.status);await writeFile('dist/assets/'+name,Buffer.from(await r.arrayBuffer()));console.log(name+' saved');}catch(e){console.log(name+' FAILED '+e.message);process.exitCode=1;}}));
await writeFile('asset-sources.json',JSON.stringify(Object.fromEntries(Object.entries(resources).map(([name,url])=>[name,name==='fortuna-logo.jpg'?'https://www.instagram.com/fortuna_personal_ast/':url])),null,2));
