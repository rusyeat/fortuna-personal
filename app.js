import {COMPANY,SERVICES,estimate,validPhone,canAdvance,buildRequest,whatsappURL} from './domain.js';
import {TEXT} from './content.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let language='ru';try{const saved=localStorage.getItem('fortuna-language');if(TEXT[saved])language=saved;}catch{}
let step=1,state={property:'',service:'',area:'',extras:[],when:'',name:'',phone:'',address:'',comment:'',consent:false};
let lastRequest=null,lastMessage='',toastTimer;
const t=key=>TEXT[language][key]??key;
const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₸';
const paths={
 chat:'<path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-5a9 9 0 1 1 16.6-4.5Z"/><path d="M8 9h8M8 13h5"/>',
 phone:'<path d="m8 3 3 5-3 3c2 3 3 4 5 5l3-3 5 3-1 4c-8 3-19-8-16-16Z"/>',
 instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 windows:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M4 11h16M7 6l2 2m6 6 2 2"/>',
 facade:'<path d="M4 21V6l8-3 8 3v15M2 21h20M8 8h2m4 0h2M8 12h2m4 0h2M8 16h2m4 0h2M11 21v-3h2v3"/>',
 parking:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
 entrance:'<path d="M3 21h18M5 21V3h14v18M9 21v-8h6v8M8 7h2m4 0h2"/>',
 territory:'<path d="M3 21h18M12 21v-6m0 0c-7 0-9-7-5-10 0 4 5 3 5 10Zm0 0c7 0 9-7 5-10 0 4-5 3-5 10Z"/>',
 commercial:'<rect x="4" y="7" width="16" height="14" rx="1"/><path d="M8 7V3h8v4M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3"/>',
 contract:'<path d="M6 3h9l4 4v14H6ZM15 3v5h4M9 12h7m-7 4h7"/>',
 calculate:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h1m6 0h1m-8 4h1m6 0h1m-8 4h1m6 0h1"/>',
 clean:'<path d="m14 3-5 11m-4-1 10 4-3 5H3l2-9Zm13-9 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>',
 supervisor:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3M8 14l4 4 4-4"/>',
 cleaner:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3M9 14v8m6-8v8"/>',
 grounds:'<path d="M12 21v-8M8 5a4 4 0 0 1 8 0 4 4 0 0 1 2 7 6 6 0 0 1-12 0 4 4 0 0 1 2-7ZM5 21h14"/>'
};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.clean}</svg>`;
function hydrateIcons(){ $$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon)); }
function genericWhatsapp(){return whatsappURL(t('simpleGreeting'));}
function renderSections(){
 $('#services-carousel').innerHTML=t('services').map(([id,title,desc,image,service])=>`<article class="service-card"><img src="./assets/${image}" width="650" height="500" alt="${esc(title)}" loading="lazy"><div class="service-card-body"><h3>${title}</h3><p>${desc}</p><button class="text-link" type="button" data-service="${service}">${t('calculate')}</button></div></article>`).join('');
 $('#price-grid').innerHTML=t('prices').map(([id,image,price,included,suitable])=>`<article class="price-card"><img src="./assets/${image}" alt="${esc(t(id))}" width="650" height="500" loading="lazy"><div class="price-card-body"><h3>${id==='maintenance'?'🧼':id==='general'?'✨':'🛠️'} ${t(id)}</h3><div class="price-value">${price?language==='ru'?`${t('from')} ${money(price)}`:`${money(price)} ${t('from')}`:t('onRequest')}</div><h4>${t('included')}</h4><ul class="includes">${included.map(s=>`<li>${s}</li>`).join('')}</ul><h4>${t('ideal')}</h4><ul class="suitable">${suitable.map(s=>`<li>${s}</li>`).join('')}</ul>${price?`<p class="price-caption">${t('unitCaption')}</p>`:''}<button type="button" class="button blue" data-service="${id}">${t('order')}</button></div></article>`).join('');
 $('#extras-grid').innerHTML=['windows','facade','commercial','parking','entrance','territory'].map(id=>`<button type="button" class="extra-card" data-service="${id==='facade'?'windows':id==='commercial'?'general':id}">${icon(id)}<strong>${t(id)}</strong>${id==='parking'||id==='entrance'?`<small class="rate">${language==='ru'?'от ':''}${id==='parking'?100:450} ${t('perSq')}${language==='kk'?' бастап':''}</small><small>${t('rateCaption')}</small>`:`<small>${t('extraPrice')}</small>`}</button>`).join('');
 const business=[['residential','work-1.jpeg','general'],['parking','service-parking.jpg','parking'],['territory','service-exterior.jpeg','territory'],['commercial','service-office.jpg','general'],['windows','service-house.jpg','windows']];
 $('#business-grid').innerHTML=business.map(([id,image,service])=>`<button class="business-card" type="button" data-service="${service}"><img src="./assets/${image}" alt="" width="600" height="500" loading="lazy"><h3>${t(id)}</h3><span>${t('getQuote')}</span></button>`).join('');
 $('#process-grid').innerHTML=t('process').map(([title,desc],i)=>`<article class="process-item"><div class="process-icon">${icon(['chat','contract','clean','check'][i])}</div><h3>${title}</h3><p>${desc}</p></article>`).join('');
 const reviews=[['Нұржан Байдүйсенов','Жақсы жұмыс жасайды'],['Айбек Жумабаев','Оперативно! Честно!'],['Камила Утегенова','Очень понравился клининг']];
 $('#review-grid').innerHTML=reviews.map(([name,quote])=>`<article class="review-card"><div class="review-header"><span class="review-avatar">${esc(name[0])}</span><strong>${esc(name)}</strong></div><blockquote>«${quote}»</blockquote><a href="${COMPANY.map}/tab/reviews" target="_blank" rel="noopener noreferrer">${t('source')} · ${t('readFull')}</a></article>`).join('');
 $('#team-grid').innerHTML=t('roles').map(([id,title,desc])=>`<article class="team-card"><div class="team-icon">${icon(id)}</div><h3>${title}</h3><p>${desc}</p></article>`).join('');
 $('#faq-list').innerHTML=t('faq').map(([q,a],i)=>`<details ${i===0?'open':''}><summary>${q}</summary><p>${a}</p></details>`).join('');
 $('#about-copy').innerHTML=t('about').map(s=>`<p>${s}</p>`).join('');
 const previous=$('#contact-service').value;$('#contact-service').innerHTML=SERVICES.map(id=>`<option value="${id}" ${previous===id?'selected':''}>${t(id)}</option>`).join('');
}
function snapshotFields(){if($('#quiz-area'))state.area=$('#quiz-area').value;const form=$('#quiz-contact');if(!form)return;const data=new FormData(form);for(const key of ['name','phone','address','comment'])state[key]=String(data.get(key)||'');state.consent=data.has('consent');}
function summaryHTML(data=state){
 const rows=[[t('object'),t(data.property)],[t('service'),t(data.service)],[t('area'),`${esc(data.area)} м²`],[t('extras'),data.extras?.length?data.extras.map(t).join(', '):t('none')],[t('when'),t(data.when)]];
 return `<dl class="quiz-summary">${rows.filter(([_,v])=>v&&!v.includes('undefined')).map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
}
function estimateHTML(){const result=estimate(state.service,state.area,state.extras);if(!result||result.base===null)return `<div class="quiz-estimate"><strong>${t('individual')}</strong><p>${t('individualHint')}</p></div>`;
 return `<div class="quiz-estimate"><strong>${language==='ru'?'от ':''}${money(result.base)}${language==='kk'?' бастап':''}</strong><p>${t('estimateHint')}${result.pendingExtras?' '+t('extrasPending'):''}</p></div>`;
}
function choice(id,value,selected){return `<button type="button" class="text-choice ${selected?'selected':''}" data-choice="${id}" data-value="${value}" aria-pressed="${!!selected}"><span class="choice-radio"></span>${t(value)}</button>`;}
function field(name,label,type='text',placeholder='',full=false){return `<label class="field ${full?'full':''}"><span>${t(label)}</span><input type="${type}" name="${name}" value="${esc(state[name])}" placeholder="${esc(placeholder)}" ${name==='phone'?'autocomplete="tel" inputmode="tel" maxlength="24"':name==='name'?'autocomplete="name" maxlength="100"':'maxlength="250"'} ${['name','phone'].includes(name)?'required':''}></label>`;}
function renderQuiz(){
 let content='';
 if(step===1)content=`<div class="quiz-options">${['apartment','house','office'].map(id=>`<button type="button" class="image-choice ${state.property===id?'selected':''}" data-choice="property" data-value="${id}" aria-pressed="${state.property===id}"><img src="./assets/room-${id}.jpg" alt="" width="250" height="250"><span>${t(id)}</span><span class="choice-check">✓</span></button>`).join('')}</div>`;
 if(step===2)content=`<div class="quiz-choices">${SERVICES.map(id=>choice('service',id,state.service===id)).join('')}</div>`;
 if(step===3)content=`<p class="quiz-help">${t('areaHelp')}</p><label class="field area-field"><span>${t('areaLabel')}</span><input id="quiz-area" type="number" inputmode="decimal" min="0.1" max="100000" step="0.1" value="${esc(state.area)}" placeholder="${t('areaPlaceholder')}" required></label>`;
 if(step===4)content=`<div class="quiz-choices">${['windows','facade','territory'].map(id=>choice('extras',id,state.extras.includes(id))).join('')}${choice('extras','none',state.extras.length===0)}</div>`;
 if(step===5)content=`<div class="quiz-choices">${['today','tomorrow','week','later'].map(id=>choice('when',id,state.when===id)).join('')}</div>`;
 if(step===6)content=estimateHTML()+summaryHTML();
 if(step===7)content=`<form id="quiz-contact" novalidate><div class="field-grid">${field('name','nameLabel','text',t('namePlaceholder'))}${field('phone','phoneLabel','tel','+7 (___) ___ __ __')}${field('address','addressLabel','text',t('addressPlaceholder'),true)}<label class="field full"><span>${t('commentLabel')}</span><textarea name="comment" maxlength="500" placeholder="${t('commentPlaceholder')}">${esc(state.comment)}</textarea></label></div><label class="consent"><input type="checkbox" name="consent" ${state.consent?'checked':''} required><span>${t('consent')}</span></label></form>`;
 $('#quiz-content').innerHTML=`<div class="quiz-body"><h3 id="quiz-title" tabindex="-1">${t('step'+step)}</h3>${content}<div class="quiz-error" role="alert" hidden></div><div class="quiz-footer"><span class="quiz-step">${t('step')}: ${step}/7</span><div class="quiz-footer-actions">${step>1?`<button type="button" class="button outline back-button" data-quiz="back">${t('back')}</button>`:''}<button type="button" class="button blue ${step===7?'submit-button':''}" data-quiz="next">${t(step===7?'sendRequest':'next')}</button></div></div></div>`;
 $('.quiz-progress').setAttribute('aria-valuenow',step);$('.quiz-progress>span').style.width=(step/7*100)+'%';
}
function setQuizError(key){const error=$('.quiz-error');error.textContent=t(key);error.hidden=false;}
function nextStep(){
 if(step===3)state.area=$('#quiz-area').value;
 if(step===7){snapshotFields();if(!state.name.trim())return setQuizError('invalidName');if(!validPhone(state.phone))return setQuizError('invalidPhone');if(!state.consent)return setQuizError('needConsent');openRequest({...state,extras:[...state.extras]});return;}
 if(!canAdvance(step,state))return setQuizError(step===3?'invalidArea':'chooseOne');
 step++;renderQuiz();$('#quiz-title').focus({preventScroll:true});$('#quiz-title').scrollIntoView({block:'start',behavior:'smooth'});
}
function startService(id){if(!SERVICES.includes(id))return;snapshotFields();state.service=id;step=1;renderQuiz();$('#calculator').scrollIntoView({block:'start',behavior:'smooth'});}
function renderRequest(){
 lastMessage=buildRequest(lastRequest,TEXT[language],language);
 $('#request-dialog-content').innerHTML=`<div class="request-icon">${icon('check')}</div><h2 id="request-title">${t('requestTitle')}</h2><p>${t('requestSubtitle')}</p><details class="request-details"><summary>${t('viewMessage')}</summary><pre class="request-preview">${esc(lastMessage)}</pre></details><a class="button green" id="request-whatsapp" href="${esc(whatsappURL(lastMessage))}" target="_blank" rel="noopener noreferrer">${t('sendWhatsapp')}</a><button type="button" class="button outline" data-action="copy">${t('copy')}</button><p class="form-note">${t('requestNote')}</p>`;
}
function openRequest(data){lastRequest=data;renderRequest();$('#request-dialog').showModal();}
function toast(text){clearTimeout(toastTimer);$('.toast').textContent=text;$('.toast').classList.add('visible');toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),3000);}
function setMenu(open){$('.menu-toggle').setAttribute('aria-expanded',open);$('.menu-toggle').setAttribute('aria-label',t(open?'menuClose':'menuOpen'));$('#mobile-menu').hidden=!open;}
function renderLanguage(){
 document.documentElement.lang=language;document.title=language==='ru'?'Fortuna Personal — клининг и уборка в Астане':'Fortuna Personal — Астанадағы клининг және тазалау';
 $$('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));$$('[data-t-html]').forEach(el=>el.innerHTML=t(el.dataset.tHtml));$$('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.lang===language));
 $$('[data-whatsapp]').forEach(el=>el.href=genericWhatsapp());renderSections();renderQuiz();hydrateIcons();setMenu(false);if($('#request-dialog').open)renderRequest();
 try{localStorage.setItem('fortuna-language',language);}catch{}
}
document.addEventListener('click',async event=>{
 const el=event.target.closest('button,a');if(!el)return;
 if(el.dataset.lang){snapshotFields();language=el.dataset.lang;renderLanguage();return;}
 if(el.classList.contains('menu-toggle')){setMenu(el.getAttribute('aria-expanded')!=='true');return;}
 if(el.closest('#mobile-menu'))setMenu(false);
 if(el.dataset.choice){
   const key=el.dataset.choice,value=el.dataset.value;
   if(key==='extras'){if(value==='none')state.extras=[];else if(state.extras.includes(value))state.extras=state.extras.filter(v=>v!==value);else state.extras.push(value);}else state[key]=value;
   $$('.quiz-error').forEach(e=>e.hidden=true);renderQuiz();return;
 }
 if(el.dataset.quiz==='next'){nextStep();return;}
 if(el.dataset.quiz==='back'){if(step===3)state.area=$('#quiz-area').value;snapshotFields();step=Math.max(1,step-1);renderQuiz();$('#quiz-title').scrollIntoView({block:'start',behavior:'smooth'});return;}
 if(el.dataset.service){startService(el.dataset.service);return;}
 if(el.dataset.scroll){const carousel=$('#services-carousel');carousel.scrollBy({left:Number(el.dataset.scroll)*(carousel.clientWidth+30),behavior:'smooth'});return;}
 if(el.id==='messenger-toggle'){const open=el.getAttribute('aria-expanded')!=='true';el.setAttribute('aria-expanded',open);$('#messenger-menu').hidden=!open;return;}
 if(el.classList.contains('dialog-close')){$('#request-dialog').close();return;}
 if(el.dataset.action==='copy'){try{await navigator.clipboard.writeText(lastMessage);toast(t('copied'));}catch{toast(t('copyFailed'));}}
});
$('#contact-form').addEventListener('submit',event=>{
 event.preventDefault();const data=Object.fromEntries(new FormData(event.target));const error=$('#contact-form .form-error');
 let key=!String(data.name||'').trim()?'invalidName':!validPhone(data.phone)?'invalidPhone':!data.consent?'needConsent':null;
 if(key){error.textContent=t(key);error.hidden=false;return;}error.hidden=true;
 openRequest({name:data.name,phone:data.phone,service:data.service,extras:[]});
});
document.addEventListener('submit',event=>{if(event.target.id==='quiz-contact'){event.preventDefault();nextStep();}});
$('#request-dialog').addEventListener('click',event=>{if(event.target!==event.currentTarget)return;const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.currentTarget.close();});
renderLanguage();
