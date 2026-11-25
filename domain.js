export const COMPANY=Object.freeze({name:'Fortuna Personal',phone:'77081090179',map:'https://2gis.kz/astana/firm/70000001066411356',instagram:'https://www.instagram.com/fortuna_personal_ast/',since:2017,rating:4.5,ratings:27,lat:51.101091,lon:71.41325});
export const SERVICES=['maintenance','general','renovation','parking','entrance','territory','windows'];
// Only explicit per-square-metre rates from the company's own website are calculated.
// The 750 KZT listing on 2GIS does not specify a unit, so it must not be multiplied by area.
export const RATES=Object.freeze({parking:100,entrance:450});
export function validPhone(value){return /^(7|8)\d{10}$/.test(String(value).replace(/\D/g,''));}
export function estimate(service,area,extras=[]){
 const size=Number(String(area).replace(',','.'));
 if(!SERVICES.includes(service)||!Number.isFinite(size)||size<0.1||size>100000)return null;
 const rate=RATES[service]??null;
 return {rate,area:size,base:rate===null?null:Math.round(rate*size),pendingExtras:extras.length>0,provisional:true};
}
export function canAdvance(step,data){
 if(step===1)return ['apartment','house','office'].includes(data.property);
 if(step===2)return SERVICES.includes(data.service);
 if(step===3)return estimate(data.service,data.area)!==null;
 if(step===4)return Array.isArray(data.extras);
 if(step===5)return ['today','tomorrow','week','later'].includes(data.when);
 return true;
}
export function buildRequest(data,labels,lang='ru'){
 if(!data.name?.trim()||!validPhone(data.phone))throw new Error('INVALID_CONTACT');
 if(!SERVICES.includes(data.service))throw new Error('INVALID_SERVICE');
 const kk=lang==='kk';const estimateData=estimate(data.service,data.area,data.extras||[]);
 return [`FORTUNA PERSONAL`,kk?'Клинингке өтінім':'Заявка на клининг','',`${kk?'Қызмет':'Услуга'}: ${labels[data.service]}`,
 data.property?`${kk?'Нысан':'Объект'}: ${labels[data.property]}`:'',
 estimateData?`${kk?'Аудан':'Площадь'}: ${estimateData.area} м²`:'',
 data.extras?.length?`${kk?'Қосымша':'Дополнительно'}: ${data.extras.map(e=>labels[e]||e).join(', ')}`:'',
 data.when?`${kk?'Қашан':'Когда'}: ${labels[data.when]}`:'',
 estimateData?.base!==null&&estimateData?.base!==undefined?`${kk?'Алдын ала':'Предварительно'}: ${estimateData.base} ₸${estimateData.pendingExtras?(kk?' + қосымша қызметтер жеке есептеледі':' + доп. услуги по согласованию'):''}`:(kk?'Баға: жеке есептеуді сұраймын.':'Стоимость: прошу индивидуальный расчёт.'),
 '',`${kk?'Аты-жөні':'Имя'}: ${data.name.trim()}`,`${kk?'Телефон':'Телефон'}: ${data.phone.trim()}`,
 data.address?.trim()?`${kk?'Мекенжай':'Адрес'}: ${data.address.trim()}`:'',
 data.comment?.trim()?`${kk?'Ескерту':'Комментарий'}: ${data.comment.trim()}`:'','',
 kk?'Өтінім мен уақытты, жұмыс көлемін және соңғы бағаны растауыңызды сұраймын.':'Прошу подтвердить заявку, время, объём работ и окончательную стоимость.'].filter(Boolean).join('\n');
}
export function whatsappURL(text){return `https://wa.me/${COMPANY.phone}?text=${encodeURIComponent(text)}`;}
