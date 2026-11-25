import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimate,buildRequest,whatsappURL,validPhone,canAdvance,COMPANY} from '../dist/domain.js';
import {TEXT} from '../dist/content.js';
test('calculator uses only explicit per-square-metre company rates',()=>{
 assert.deepEqual(estimate('parking','100'),{rate:100,area:100,base:10000,pendingExtras:false,provisional:true});
 assert.equal(estimate('entrance','60').base,27000);
 assert.equal(estimate('parking','10,5',['windows']).base,1050);
 assert.equal(estimate('parking','10',['windows']).pendingExtras,true);
});
test('unspecified 750 KZT price is never multiplied by area; unpublished rates stay unknown',()=>{
 for(const service of ['maintenance','general','renovation','windows','territory'])assert.equal(estimate(service,65).base,null);
});
test('invalid and unrealistic areas cannot advance',()=>{
 for(const area of ['',0,-1,'hello',Infinity,100001,0.01])assert.equal(estimate('parking',area),null);
 assert.equal(canAdvance(1,{property:''}),false);assert.equal(canAdvance(2,{service:'fake'}),false);
 assert.equal(canAdvance(3,{service:'parking',area:'50'}),true);assert.equal(canAdvance(5,{when:'week'}),true);
});
test('request preserves service, area, extras and contact; price and schedule need confirmation',()=>{
 const data={property:'office',service:'parking',area:'100',extras:['windows'],when:'tomorrow',name:'Тест Клиент',phone:'+7 700 000 0000',address:'Сынақ, 12',comment:'Тест'};
 const message=buildRequest(data,TEXT.ru,'ru');
 for(const text of ['Уборка паркинга','100 м²','10000 ₸','доп. услуги по согласованию','Завтра','Сынақ, 12','Тест Клиент','Прошу подтвердить'])assert.ok(message.includes(text),text);
 const url=new URL(whatsappURL(message));assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/'+COMPANY.phone);assert.equal(url.searchParams.get('text'),message);
});
test('Kazakh request and contact-only inquiry work without invented total',()=>{
 const message=buildRequest({name:'Сынақ',phone:'87000000000',service:'renovation'},TEXT.kk,'kk');
 assert.ok(message.includes('жеке есептеуді'));assert.ok(message.includes('Жөндеуден кейінгі'));assert.ok(!message.includes('NaN'));
 assert.throws(()=>buildRequest({name:'',phone:'123',service:'general'},TEXT.ru),/INVALID_CONTACT/);
 assert.equal(validPhone('+7 (708) 109-01-79'),true);assert.equal(validPhone('12345'),false);
});
