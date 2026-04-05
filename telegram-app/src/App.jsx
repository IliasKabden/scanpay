import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = 'http://localhost:3000/api'

const L = {
  ru:{hi:'Привет',earn:'Ваш профиль',sol:'SOL',receipts:'чеков',scan:'Сканировать чек',upload:'Загрузить',manual:'Ввести вручную',
    promoTitle:'Ваши данные —\nваша ценность',promoSub:'Сканируйте чеки, копите профиль. Когда компания купит исследование — вы получите оплату.',
    howTitle:'Как это работает',step1:'Сфотографируйте чек',step2:'AI распознает товары',step3:'Получите оплату в SOL',
    recent:'Недавнее',noReceipts:'Пока пусто',scanFirst:'Отсканируйте первый чек',
    processed:'Готово!',saved:'Сохранено в блокчейне',store:'Магазин',total:'Сумма',category:'Категория',date:'Дата',
    earned:'Начислено',more:'Ещё',done:'Готово',
    balance:'Баланс',withdraw:'Вывести',history:'История',noTx:'Нет операций',
    privacy:'Конфиденциальность',notif:'Уведомления',lang:'Язык',city:'Город',chain:'Блокчейн',
    invite:'Пригласи друга',inviteSub:'и получи 200 ₸',copy:'Скопировать ссылку',
    home:'Главная',scanTab:'Скан',wallet:'Кошелёк',profile:'Профиль',aiRead:'Распознаём...',
    camHint:'Наведите на чек',camErr:'Камера недоступна',camUpload:'Загрузить фото',
    storeName:'Название магазина',product:'Товар',price:'Сумма',save:'Сохранить',
    manualNote:'За фото чека оплата выше',manualTitle:'Ручной ввод',
  },
  kk:{hi:'Сәлем',earn:'Профиліңіз',sol:'SOL',receipts:'чек',scan:'Чекті сканерлеу',upload:'Жүктеу',manual:'Қолмен енгізу',
    promoTitle:'Деректеріңіз —\nсіздің құндылығыңыз',promoSub:'Чектерді сканерлеңіз, профиліңізді жинаңыз. Компания зерттеу сатып алғанда — сіз төлем аласыз.',
    howTitle:'Қалай жұмыс істейді',step1:'Чекті суретке түсіріңіз',step2:'AI тауарларды таниды',step3:'SOL-мен төлем алыңыз',
    recent:'Соңғы',noReceipts:'Әзірге бос',scanFirst:'Бірінші чекті сканерлеңіз',
    processed:'Дайын!',saved:'Блокчейнге сақталды',store:'Дүкен',total:'Сома',category:'Санат',date:'Күні',
    earned:'Есептелді',more:'Тағы',done:'Дайын',
    balance:'Баланс',withdraw:'Шығару',history:'Тарих',noTx:'Операциялар жоқ',
    privacy:'Құпиялылық',notif:'Хабарламалар',lang:'Тіл',city:'Қала',chain:'Блокчейн',
    invite:'Досты шақыр',inviteSub:'200 ₸ ал',copy:'Сілтемені көшіру',
    home:'Басты',scanTab:'Скан',wallet:'Әмиян',profile:'Профиль',aiRead:'Оқылуда...',
    camHint:'Чекке бағыттаңыз',camErr:'Камера қолжетімсіз',camUpload:'Фото жүктеу',
    storeName:'Дүкен атауы',product:'Тауар',price:'Сома',save:'Сақтау',
    manualNote:'Чек фотосы үшін көбірек төленеді',manualTitle:'Қолмен енгізу',
  },
  en:{hi:'Hey',earn:'Your Profile',sol:'SOL',receipts:'receipts',scan:'Scan receipt',upload:'Upload',manual:'Enter manually',
    promoTitle:'Your data —\nyour value',promoSub:'Scan receipts, build your profile. When a company buys research — you get paid.',
    howTitle:'How it works',step1:'Take a photo of receipt',step2:'AI recognizes products',step3:'Get paid in SOL',
    recent:'Recent',noReceipts:'Nothing yet',scanFirst:'Scan your first receipt',
    processed:'Done!',saved:'Saved on blockchain',store:'Store',total:'Total',category:'Category',date:'Date',
    earned:'Earned',more:'More',done:'Done',
    balance:'Balance',withdraw:'Withdraw',history:'History',noTx:'No transactions',
    privacy:'Privacy',notif:'Notifications',lang:'Language',city:'City',chain:'Blockchain',
    invite:'Invite a friend',inviteSub:'earn 200 ₸',copy:'Copy link',
    home:'Home',scanTab:'Scan',wallet:'Wallet',profile:'Profile',aiRead:'Reading...',
    camHint:'Point at receipt',camErr:'Camera unavailable',camUpload:'Upload photo',
    storeName:'Store name',product:'Product',price:'Amount',save:'Save',
    manualNote:'Photo receipts earn more',manualTitle:'Manual entry',
  }
}

export default function App(){
  const[tab,setTab]=useState('home')
  const[lang,setLang]=useState('ru')
  const[user,setUser]=useState(null)
  const[profile,setProfile]=useState(null)
  const[scanning,setScanning]=useState(false)
  const[scanResult,setScanResult]=useState(null)
  const[manualForm,setMF]=useState({store:'',product:'',price:''})
  const[city,setCity]=useState('Almaty')
  const[error,setError]=useState(null)
  const[onboarded,setOnboarded]=useState(null) // null=loading, true/false
  const[obStep,setObStep]=useState(-1) // -1=welcome slides, 0=phone, 1=age, 2=gender
  const[welcomeSlide,setWelcomeSlide]=useState(0)
  const[obData,setObData]=useState({phone:'',age_group:'',gender:''})

  const t=L[lang]||L.ru
  const bal=profile?.total_earned_tenge||0
  const sol=profile?.total_earned_lamports?(profile.total_earned_lamports/1e9).toFixed(4):'0.0000'
  const rc=profile?.receipts_count||0
  const list=profile?.receipts||[]

  useEffect(()=>{
    const tg=window.Telegram?.WebApp
    if(tg){tg.ready();tg.expand();tg.setHeaderColor('#ffffff');tg.setBackgroundColor('#ffffff')
      const u=tg.initDataUnsafe?.user
      if(u){const uid=String(u.id);setUser({id:uid,name:u.first_name,last_name:u.last_name||'',username:u.username||''});load(uid);checkOnboarding(uid);return}}
    setUser({id:'dev_123',name:'Demo',last_name:'',username:''});load('dev_123');checkOnboarding('dev_123')
  },[])

  async function checkOnboarding(tid){
    try{const r=await axios.get(`${API}/user/onboarded/${tid}`);setOnboarded(r.data.onboarded)}catch{setOnboarded(true)}
  }

  async function finishOnboarding(){
    const tg=window.Telegram?.WebApp
    await axios.post(`${API}/user/onboard`,{
      telegram_id:user.id, phone:obData.phone, age_group:obData.age_group, gender:obData.gender,
      first_name:user.name, last_name:user.last_name, username:user.username, city, lang
    })
    setOnboarded(true)
    if(tg?.HapticFeedback)tg.HapticFeedback.notificationOccurred('success')
  }

  function requestPhone(){
    const tg=window.Telegram?.WebApp
    if(tg?.requestContact){
      tg.requestContact((ok,res)=>{if(ok&&res?.responseUnsafe?.contact){setObData(d=>({...d,phone:res.responseUnsafe.contact.phone_number}));setObStep(1)}})
    }else{setObStep(1)} // fallback on desktop
  }

  useEffect(()=>{if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>{
    const{latitude:a,longitude:o}=p.coords
    if(a>42&&a<44&&o>76&&o<78)setCity('Almaty');else if(a>50&&a<52&&o>71&&o<72)setCity('Astana');else if(a>41&&a<43&&o>69&&o<70)setCity('Shymkent')
  },()=>{},{timeout:5000})},[])

  async function load(id){try{const r=await axios.get(`${API}/user/profile/${id}`);setProfile(r.data)}catch{}}

  async function processImage(base64){
    setScanning(true);setError(null)
    try{const r=await axios.post(`${API}/receipt/scan`,{image_base64:base64,telegram_id:user.id});setScanResult(r.data);setTab('result');load(user.id)
      // Haptic feedback + popup
      const tg=window.Telegram?.WebApp
      if(tg?.HapticFeedback)tg.HapticFeedback.notificationOccurred('success')
      if(tg?.showPopup)tg.showPopup({title:'✅ '+t.processed,message:`${t.earned}: ~${r.data.price_tenge} ₸`,buttons:[{type:'ok'}]})
    }
    catch{setError(true)}
    setScanning(false)
  }

  function handleFile(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>processImage(ev.target.result.split(',')[1]);r.readAsDataURL(f)}

  return<>
  <style>{CSS}</style>
  <div className="A">

  {/* ONBOARDING */}
  {onboarded===false&&<div className="ob">

    {/* WELCOME SLIDES */}
    {obStep===-1&&<div className="welcome">
      <div className="w-slides" style={{transform:`translateX(-${welcomeSlide*100}%)`}}>

        {/* Slide 1: What is this */}
        <div className="w-slide">
          <div className="w-visual">
            <div className="w-circle w-c1">
              <div className="w-emoji">🧾</div>
            </div>
            <div className="w-arrow">→</div>
            <div className="w-circle w-c2">
              <div className="w-emoji">🤖</div>
            </div>
            <div className="w-arrow">→</div>
            <div className="w-circle w-c3">
              <div className="w-emoji">💰</div>
            </div>
          </div>
          <div className="w-title">{lang==='kk'?'Чектеріңіз — ақшаңыз':lang==='en'?'Your receipts = your money':'Ваши чеки — ваши деньги'}</div>
          <div className="w-desc">{lang==='kk'?'Чекті сканерлеңіз, AI тауарларды таниды, ақша автоматты түрде есепке түседі':lang==='en'?'Scan a receipt, AI recognizes products, money is credited automatically':'Сканируйте чек, AI распознает товары, деньги зачислятся автоматически'}</div>
        </div>

        {/* Slide 2: Build your profile */}
        <div className="w-slide">
          <div className="w-visual">
            <div className="w-companies">
              <div className="w-comp">🧾</div>
              <div className="w-comp-arrow">→</div>
              <div className="w-comp-data">📊</div>
              <div className="w-comp-arrow">→</div>
              <div className="w-comp">👤</div>
            </div>
          </div>
          <div className="w-title">{lang==='kk'?'Профиліңізді жинаңыз':lang==='en'?'Build your profile':'Копите ваш профиль'}</div>
          <div className="w-desc">{lang==='kk'?'Неғұрлым көп чек сканерлесеңіз, соғұрлым профиліңіз құнды болады. Компаниялар маркетинг зерттеулері үшін деректер іздейді.':lang==='en'?'The more receipts you scan, the more valuable your profile becomes. Companies look for data for market research.':'Чем больше чеков сканируете — тем ценнее ваш профиль. Компании ищут данные для маркетинговых исследований.'}</div>
        </div>

        {/* Slide 3: Trust */}
        <div className="w-slide">
          <div className="w-visual">
            <div className="w-shield">
              <div className="w-shield-icon">🔒</div>
              <div className="w-shield-chain">Solana Blockchain</div>
            </div>
          </div>
          <div className="w-title">{lang==='kk'?'Деректеріңіз қорғалған':lang==='en'?'Your data is protected':'Ваши данные защищены'}</div>
          <div className="w-desc">{lang==='kk'?'Компаниялар тек жалпы статистиканы көреді. Жеке деректер блокчейнмен шифрланған.':lang==='en'?'Companies see only aggregated statistics. Personal data is encrypted on blockchain.':'Компании видят только общую статистику. Личные данные зашифрованы в блокчейне.'}</div>
        </div>

        {/* Slide 4: Honest value */}
        <div className="w-slide">
          <div className="w-visual">
            <div className="w-honest">
              <div className="w-honest-icon">🤝</div>
            </div>
          </div>
          <div className="w-title">{lang==='kk'?'Сіз шешесіз':lang==='en'?'You decide':'Вы решаете'}</div>
          <div className="w-desc">{lang==='kk'?'Деректеріңізді қашан және кімге сатуды сіз шешесіз. Компания зерттеу сатып алғанда — смарт-контракт автоматты түрде төлем жасайды.':lang==='en'?'You decide when and to whom to sell your data. When a company buys research — smart contract automatically pays you.':'Вы решаете когда и кому продавать свои данные. Когда компания покупает исследование — смарт-контракт автоматически платит.'}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-controls">
        <div className="w-dots">{[0,1,2,3].map(i=><div key={i} className={`w-dot ${welcomeSlide===i?'w-dot-on':''}`} onClick={()=>setWelcomeSlide(i)}/>)}</div>
        {welcomeSlide<3?
          <button className="w-next" onClick={()=>setWelcomeSlide(s=>s+1)}>{lang==='kk'?'Келесі':lang==='en'?'Next':'Далее'}</button>
          :<button className="w-next w-start" onClick={()=>setObStep(0)}>{lang==='kk'?'Бастау':lang==='en'?'Get Started':'Начать'}</button>
        }
        {welcomeSlide<3&&<button className="w-skip" onClick={()=>setObStep(0)}>{lang==='kk'?'Өткізу':lang==='en'?'Skip':'Пропустить'}</button>}
      </div>

      <div className="ob-lang" style={{top:12,right:12}}>{['RU','KK','EN'].map(l=><button key={l} className={`lp ${lang===l.toLowerCase()?'lp-on':''}`} onClick={()=>setLang(l.toLowerCase())}>{l}</button>)}</div>
    </div>}

    {obStep===0&&<div className="ob-screen">
      <div className="ob-ill">📱</div>
      <div className="ob-title">{lang==='kk'?'Телефон нөміріңіз':lang==='en'?'Your phone number':'Ваш номер телефона'}</div>
      <div className="ob-sub">{lang==='kk'?'Деректеріңіз қорғалған':lang==='en'?'Your data is protected':'Данные защищены блокчейном'}</div>
      <button className="ob-btn" onClick={requestPhone}>{lang==='kk'?'Нөмірді бөлісу':lang==='en'?'Share number':'Поделиться номером'}</button>
      <button className="ob-skip" onClick={()=>setObStep(1)}>{lang==='kk'?'Кейінірек':lang==='en'?'Skip':'Пропустить'}</button>
      <div className="ob-dots"><div className="ob-dot ob-dot-on"/><div className="ob-dot"/><div className="ob-dot"/></div>
    </div>}

    {obStep===1&&<div className="ob-screen">
      <div className="ob-ill">🎂</div>
      <div className="ob-title">{lang==='kk'?'Жасыңыз':lang==='en'?'Your age':'Ваш возраст'}</div>
      <div className="ob-sub">{lang==='kk'?'Анонимді статистика үшін':lang==='en'?'For anonymous statistics':'Для анонимной статистики'}</div>
      <div className="ob-options">
        {['18-24','25-34','35-44','45+'].map(a=><button key={a} className={`ob-opt ${obData.age_group===a?'ob-opt-on':''}`} onClick={()=>setObData(d=>({...d,age_group:a}))}>{a}</button>)}
      </div>
      <button className="ob-btn" disabled={!obData.age_group} onClick={()=>setObStep(2)}>{lang==='kk'?'Келесі':lang==='en'?'Next':'Далее'}</button>
      <div className="ob-dots"><div className="ob-dot"/><div className="ob-dot ob-dot-on"/><div className="ob-dot"/></div>
    </div>}

    {obStep===2&&<div className="ob-screen">
      <div className="ob-ill">👤</div>
      <div className="ob-title">{lang==='kk'?'Жынысыңыз':lang==='en'?'Your gender':'Ваш пол'}</div>
      <div className="ob-sub">{lang==='kk'?'Анонимді статистика үшін':lang==='en'?'For anonymous statistics':'Для анонимной статистики'}</div>
      <div className="ob-options ob-gender">
        {[{v:'male',ru:'Мужской',kk:'Ер',en:'Male'},{v:'female',ru:'Женский',kk:'Әйел',en:'Female'}].map(g=>
          <button key={g.v} className={`ob-opt ob-opt-wide ${obData.gender===g.v?'ob-opt-on':''}`} onClick={()=>setObData(d=>({...d,gender:g.v}))}>
            {g.v==='male'?'👨':'👩'} {g[lang]||g.ru}
          </button>
        )}
      </div>
      <button className="ob-btn" disabled={!obData.gender} onClick={finishOnboarding}>{lang==='kk'?'Бастау':lang==='en'?'Start':'Начать'}</button>
      <div className="ob-dots"><div className="ob-dot"/><div className="ob-dot"/><div className="ob-dot ob-dot-on"/></div>
    </div>}

    <div className="ob-lang">{['RU','KK','EN'].map(l=><button key={l} className={`lp ${lang===l.toLowerCase()?'lp-on':''}`} onClick={()=>setLang(l.toLowerCase())}>{l}</button>)}</div>
  </div>}

  {/* HOME */}
  {onboarded!==false&&tab==='home'&&<div className="home">
    {/* Top */}
    <div className="top">
      <div className="top-l"><div className="av">{user?.name?.[0]}</div><div className="nm">{t.hi}, {user?.name}</div></div>
      <div className="lang-pills">{['RU','KK','EN'].map((l,i)=><button key={l} className={`lp ${lang===l.toLowerCase()?'lp-on':''}`} onClick={()=>setLang(l.toLowerCase())}>{l}</button>)}</div>
    </div>

    {/* Balance */}
    <div className="bal">
      <div className="bal-top">
        <div className="bal-label">{t.earn}</div>
        <div className="bal-city">{city}</div>
      </div>
      <div className="bal-amount">{bal.toLocaleString()}<span>₸</span></div>
      <div className="bal-sol">{sol} {t.sol} &middot; {rc} {t.receipts}</div>
    </div>

    {/* Main CTA */}
    <button className="cta" onClick={()=>{setTab('camera');window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')}}>
      <div className="cta-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
      </div>
      <div className="cta-text">
        <div className="cta-title">{t.scan}</div>
        <div className="cta-sub">+5 points</div>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>

    {/* Secondary */}
    <div className="sec">
      <label className="sec-card">
        <div className="sc-icon">📁</div>
        <div className="sc-title">{t.upload}</div>
        <div className="sc-sub">+3 points</div>
        <input type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/>
      </label>
      <div className="sec-card" onClick={()=>setTab('manual')}>
        <div className="sc-icon">✏️</div>
        <div className="sc-title">{t.manual}</div>
        <div className="sc-sub">+1 point</div>
      </div>
    </div>

    {/* Promo (only for new users) */}
    {rc<3&&<div className="promo">
      <div className="promo-content">
        <div className="promo-t">{t.promoTitle}</div>
        <div className="promo-s">{t.promoSub}</div>
      </div>
    </div>}

    {/* How it works */}
    {rc<3&&<div className="how">
      <div className="how-title">{t.howTitle}</div>
      <div className="how-steps">
        <div className="how-step"><div className="hs-num">1</div><div className="hs-text">{t.step1}</div></div>
        <div className="how-step"><div className="hs-num">2</div><div className="hs-text">{t.step2}</div></div>
        <div className="how-step"><div className="hs-num">3</div><div className="hs-text">{t.step3}</div></div>
      </div>
    </div>}

    {/* Recent */}
    <div className="sec-title">{t.recent}</div>
    {list.length===0?<div className="empty"><div className="empty-i">📋</div><div className="empty-t">{t.noReceipts}</div><div className="empty-s">{t.scanFirst}</div></div>
    :<div className="list">{list.slice(0,6).map((e,i)=>
      <div key={e.id||i} className="li">
        <div className="li-emoji">{e.category==='food'?'🛒':e.category==='drinks'?'🥤':e.category==='cafe'?'☕':'📦'}</div>
        <div className="li-body"><div className="li-name">{e.store_name||'—'}</div><div className="li-date">{e.date||e.created_at?.slice(0,10)}</div></div>
        <div className="li-right"><div className="li-sum">{e.total_amount?.toLocaleString()} ₸</div><div className="li-earn">+{Math.round((e.price_lamports||5e6)*45e-5)} ₸</div></div>
      </div>
    )}</div>}

    {scanning&&<div className="loading"><div className="ld-spinner"/><div className="ld-text">{t.aiRead}</div></div>}
  </div>}

  {/* CAMERA */}
  {tab==='camera'&&<Camera onCapture={b=>{const r=new FileReader();r.onload=ev=>processImage(ev.target.result.split(',')[1]);r.readAsDataURL(b)}} onClose={()=>setTab('home')} t={t} onFile={handleFile}/>}

  {/* RESULT */}
  {tab==='result'&&scanResult&&<div className="page">
    <div className="page-top"><button className="back" onClick={()=>{setTab('home');setScanResult(null)}}>&larr;</button></div>
    <div className="res-hero"><div className="res-check">✓</div><div className="res-title">{t.processed}</div><div className="res-sub">{t.saved}</div></div>
    <div className="card">{[
      [t.store,scanResult.parsed_data?.store_name],
      [t.total,`${scanResult.parsed_data?.total_amount?.toLocaleString()} ₸`],
      [t.category,scanResult.parsed_data?.category],
      [t.date,scanResult.parsed_data?.date],
    ].map(([k,v],i)=><div key={i} className="card-row"><span className="cr-k">{k}</span><span className="cr-v">{v}</span></div>)}</div>
    <div className="earn-card"><div className="ec-label">{t.earned}</div><div className="ec-amount">~{scanResult.price_tenge} ₸</div></div>
    <div className="res-btns">
      <button className="cta" onClick={()=>setTab('camera')} style={{marginBottom:8}}><div className="cta-text"><div className="cta-title">{t.more}</div></div></button>
      <button className="btn-ghost" onClick={()=>{setTab('home');setScanResult(null)}}>{t.done}</button>
    </div>
  </div>}

  {/* MANUAL */}
  {tab==='manual'&&<div className="page">
    <div className="page-top"><button className="back" onClick={()=>setTab('home')}>&larr;</button><span>{t.manualTitle}</span></div>
    <div className="form">
      <div className="fi"><label>{t.storeName}</label><input placeholder="Magnum, Small..." value={manualForm.store} onChange={e=>setMF({...manualForm,store:e.target.value})}/></div>
      <div className="fi"><label>{t.product}</label><input placeholder="Coca-Cola Zero..." value={manualForm.product} onChange={e=>setMF({...manualForm,product:e.target.value})}/></div>
      <div className="fi"><label>{t.price} (₸)</label><input type="number" placeholder="0" value={manualForm.price} onChange={e=>setMF({...manualForm,price:e.target.value})}/></div>
      <button className="cta" style={{marginTop:8}} disabled={!manualForm.store||!manualForm.price}><div className="cta-text"><div className="cta-title">{t.save}</div></div></button>
      <p className="form-note">{t.manualNote}</p>
    </div>
  </div>}

  {/* WALLET */}
  {tab==='wallet'&&<div className="page">
    <div className="wallet-top">
      <div className="wt-label">{t.balance}</div>
      <div className="wt-amount">{bal.toLocaleString()} ₸</div>
      <div className="wt-sol">{sol} SOL</div>
      <button className="wt-btn">{t.withdraw}</button>
    </div>
    <div className="sec-title">{t.history}</div>
    {list.length===0?<div className="empty"><div className="empty-t">{t.noTx}</div></div>
    :<div className="list">{list.map((e,i)=>
      <div key={i} className="li">
        <div className="li-emoji" style={{background:'#e6f4ea'}}>+</div>
        <div className="li-body"><div className="li-name">{e.store_name||'—'}</div><div className="li-date">{e.date||e.created_at?.slice(0,10)}</div></div>
        <div className="li-earn" style={{fontSize:14}}>+{Math.round((e.price_lamports||5e6)*45e-5)} ₸</div>
      </div>
    )}</div>}
  </div>}

  {/* PROFILE */}
  {tab==='profile'&&<div className="page">
    <div className="prof-top"><div className="prof-av">{user?.name?.[0]}</div><div className="prof-name">{user?.name}</div><div className="prof-sub">{city} &middot; ID: {user?.id}</div></div>
    <div className="prof-stats">
      <div className="pst"><div className="pst-v">{rc}</div><div className="pst-l">{t.receipts}</div></div>
      <div className="pst"><div className="pst-v">{bal.toLocaleString()}</div><div className="pst-l">₸</div></div>
      <div className="pst"><div className="pst-v">{sol}</div><div className="pst-l">SOL</div></div>
    </div>
    <div className="invite" onClick={()=>navigator.clipboard?.writeText(`https://t.me/mening_deregim_bot?start=ref_${user?.id}`)}>
      <div className="inv-left"><div className="inv-icon">🎁</div><div><div className="inv-t">{t.invite}</div><div className="inv-s">{t.inviteSub}</div></div></div>
      <div className="inv-btn">{t.copy}</div>
    </div>
    <div className="menu">
      <div className="mi"><span>{t.privacy}</span><span className="mi-a">&rsaquo;</span></div>
      <div className="mi"><span>{t.notif}</span><span className="mi-a">&rsaquo;</span></div>
      <div className="mi"><span>{t.lang}</span><div className="lang-pills">{['RU','KK','EN'].map(l=><button key={l} className={`lp ${lang===l.toLowerCase()?'lp-on':''}`} onClick={()=>setLang(l.toLowerCase())}>{l}</button>)}</div></div>
      <div className="mi"><span>{t.city}</span><span className="mi-v">{city}</span></div>
      <div className="mi"><span>{t.chain}</span><span className="mi-v">Solana</span></div>
    </div>
    <div className="footer">ScanPay<br/><span>v1.0 &middot; Solana</span></div>
  </div>}

  {/* NAV */}
  {onboarded!==false&&<nav className="nav">
    {[{id:'home',l:t.home,d:'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z'},{id:'_scan',l:t.scanTab,d:'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 13a4 4 0 100-8 4 4 0 000 8z'},{id:'wallet',l:t.wallet,d:'M2 4h20v16H2zM22 10h-6a2 2 0 000 4h6'},{id:'profile',l:t.profile,d:'M12 12a4 4 0 100-8 4 4 0 000 8zM20 21a8 8 0 10-16 0'}].map(n=>
    <button key={n.id} className={`nb ${(tab===n.id||(n.id==='home'&&['result','manual','camera'].includes(tab)))?'nb-on':''}`}
      onClick={()=>n.id==='_scan'?setTab('camera'):setTab(n.id)}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={n.d}/></svg>
      <span>{n.l}</span>
    </button>
  )}
  </nav>}

  </div>
  </>
}

function Camera({onCapture,onClose,t,onFile}){
  const vRef=useRef(),cRef=useRef()
  const[stream,setStream]=useState(null)
  const[ok,setOk]=useState(false)
  const[err,setErr]=useState(false)

  useEffect(()=>{let s;navigator.mediaDevices?.getUserMedia({video:{facingMode:'environment',width:{ideal:1920}}})
    .then(st=>{s=st;setStream(st);if(vRef.current){vRef.current.srcObject=st;vRef.current.onloadedmetadata=()=>setOk(true)}}).catch(()=>setErr(true))
    return()=>s?.getTracks().forEach(t=>t.stop())},[])

  function snap(){const v=vRef.current,c=cRef.current;if(!v||!c)return;c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0)
    c.toBlob(b=>{stream?.getTracks().forEach(t=>t.stop());onCapture(b)},'image/jpeg',.85)}

  if(err)return<div className="cam"><div className="cam-err">
    <div style={{fontSize:56,marginBottom:20}}>📷</div>
    <div className="cam-err-t">{t.camErr}</div>
    <label className="cam-err-btn">{t.camUpload}<input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(f)onCapture(f)}}/></label>
    <button className="cam-err-close" onClick={onClose}>&times;</button>
  </div></div>

  return<div className="cam">
    <video ref={vRef} autoPlay playsInline muted className="cam-v"/>
    <canvas ref={cRef} style={{display:'none'}}/>
    <div className="cam-ui">
      <div className="cam-top"><button className="cam-x" onClick={()=>{stream?.getTracks().forEach(t=>t.stop());onClose()}}>&times;</button></div>
      <div className="cam-mid"><div className="cam-frame"><div className="cf-corner cf-tl"/><div className="cf-corner cf-tr"/><div className="cf-corner cf-bl"/><div className="cf-corner cf-br"/></div></div>
      <div className="cam-hint">{t.camHint}</div>
      <div className="cam-bot"><button className="cam-shutter" onClick={snap} disabled={!ok}><div className="cam-dot"/></button></div>
    </div>
  </div>
}

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{font-family:'Inter',-apple-system,system-ui,sans-serif;background:#fff;color:#1a1a1a;-webkit-font-smoothing:antialiased}
.A{max-width:430px;margin:0 auto;min-height:100vh;padding-bottom:76px;background:#fff}

/* TOP */
.top{display:flex;justify-content:space-between;align-items:center;padding:14px 20px}
.top-l{display:flex;align-items:center;gap:10px}
.av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700}
.nm{font-size:16px;font-weight:600}
.lang-pills{display:flex;background:#f3f4f6;border-radius:10px;overflow:hidden}
.lp{padding:5px 12px;border:none;background:transparent;color:#9ca3af;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit}
.lp-on{background:#3b82f6;color:#fff;border-radius:8px}

/* BALANCE */
.bal{margin:4px 20px 20px;background:linear-gradient(135deg,#1e293b,#334155);border-radius:24px;padding:28px 24px;color:#fff}
.bal-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.bal-label{font-size:13px;color:rgba(255,255,255,.5);font-weight:500}
.bal-city{font-size:11px;color:rgba(255,255,255,.35);background:rgba(255,255,255,.1);padding:3px 10px;border-radius:20px}
.bal-amount{font-size:48px;font-weight:800;letter-spacing:-3px;line-height:1.1}
.bal-amount span{font-size:24px;opacity:.4;margin-left:2px}
.bal-sol{font-size:12px;color:rgba(255,255,255,.35);margin-top:6px}

/* CTA */
.cta{display:flex;align-items:center;gap:14px;width:calc(100% - 40px);margin:0 20px 12px;padding:18px 22px;background:linear-gradient(135deg,#3b82f6,#2563eb);border:none;border-radius:20px;color:#fff;cursor:pointer;font-family:inherit;text-align:left;box-shadow:0 8px 24px rgba(59,130,246,.25);transition:transform .1s;position:relative;overflow:hidden}
.cta::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent 60%,rgba(255,255,255,.1));pointer-events:none}
.cta:active{transform:scale(.98)}
.cta:disabled{opacity:.4}
.cta-icon{width:52px;height:52px;border-radius:16px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cta-text{flex:1}
.cta-title{font-size:17px;font-weight:700}
.cta-sub{font-size:12px;opacity:.6;margin-top:2px}

/* SECONDARY */
.sec{display:flex;gap:10px;padding:0 20px;margin-bottom:24px}
.sec-card{flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;text-align:center;cursor:pointer;transition:background .12s}
.sec-card:active{background:#f1f5f9}
.sc-icon{font-size:28px;margin-bottom:8px}
.sc-title{font-size:14px;font-weight:600;color:#1e293b}
.sc-sub{font-size:12px;color:#10b981;font-weight:600;margin-top:2px}

/* PROMO */
.promo{margin:0 20px 16px;background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:20px;padding:24px}
.promo-t{font-size:22px;font-weight:800;color:#1e40af;line-height:1.2;white-space:pre-line;margin-bottom:8px}
.promo-s{font-size:13px;color:#3b82f6;line-height:1.4}

/* HOW */
.how{margin:0 20px 20px}
.how-title{font-size:14px;font-weight:700;color:#64748b;margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px}
.how-steps{display:flex;gap:12px}
.how-step{flex:1;text-align:center}
.hs-num{width:32px;height:32px;border-radius:50%;background:#3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;margin:0 auto 8px}
.hs-text{font-size:12px;color:#475569;line-height:1.3}

/* SECTION */
.sec-title{font-size:13px;font-weight:700;color:#94a3b8;padding:0 20px 10px;text-transform:uppercase;letter-spacing:.5px}

/* LIST */
.list{padding:0 20px}
.li{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid #f1f5f9}
.li-emoji{width:42px;height:42px;border-radius:14px;background:#f8fafc;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.li-body{flex:1}
.li-name{font-size:15px;font-weight:500}
.li-date{font-size:11px;color:#94a3b8;margin-top:1px}
.li-right{text-align:right}
.li-sum{font-size:15px;font-weight:600}
.li-earn{font-size:12px;color:#10b981;font-weight:600}

/* EMPTY */
.empty{text-align:center;padding:32px 20px}
.empty-i{font-size:40px;margin-bottom:8px}
.empty-t{font-size:15px;font-weight:500;color:#94a3b8}
.empty-s{font-size:12px;color:#cbd5e1;margin-top:2px}

/* LOADING */
.loading{position:fixed;inset:0;background:rgba(255,255,255,.92);backdrop-filter:blur(16px);z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
.ld-spinner{width:40px;height:40px;border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ld-text{font-size:14px;color:#64748b}

/* PAGE */
.page{padding:0 0 20px}
.page-top{display:flex;align-items:center;gap:10px;padding:14px 20px}
.back{background:none;border:none;font-size:22px;color:#64748b;cursor:pointer;padding:4px}

/* RESULT */
.res-hero{text-align:center;padding:28px 0}
.res-check{width:64px;height:64px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:28px;color:#16a34a}
.res-title{font-size:24px;font-weight:800;color:#16a34a}
.res-sub{font-size:13px;color:#64748b;margin-top:4px}
.card{margin:0 20px 12px;background:#f8fafc;border-radius:16px;padding:4px 16px}
.card-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f1f5f9;font-size:14px}
.card-row:last-child{border:none}
.cr-k{color:#94a3b8}
.cr-v{font-weight:600}
.earn-card{margin:0 20px 16px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);border-radius:16px;padding:20px;text-align:center}
.ec-label{font-size:12px;color:#15803d;text-transform:uppercase;letter-spacing:1px}
.ec-amount{font-size:32px;font-weight:800;color:#15803d;margin-top:4px}
.res-btns{padding:0 20px}
.btn-ghost{width:100%;padding:14px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;color:#1e293b;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit}

/* FORM */
.form{padding:20px}
.fi{margin-bottom:14px}
.fi label{display:block;font-size:12px;color:#94a3b8;margin-bottom:4px;font-weight:500;text-transform:uppercase;letter-spacing:.5px}
.fi input,.fi select{width:100%;padding:14px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;font-size:15px;color:#1e293b;outline:none;font-family:inherit}
.fi input:focus{border-color:#3b82f6}
.fi input::placeholder{color:#cbd5e1}
.form-note{font-size:11px;color:#cbd5e1;text-align:center;margin-top:8px}

/* WALLET */
.wallet-top{text-align:center;padding:32px 20px 28px;background:linear-gradient(180deg,#f8fafc,#fff);border-radius:0 0 28px 28px}
.wt-label{font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px}
.wt-amount{font-size:48px;font-weight:800;letter-spacing:-2px;margin:8px 0 4px}
.wt-sol{font-size:13px;color:#94a3b8;margin-bottom:18px}
.wt-btn{padding:12px 32px;border:none;border-radius:50px;background:#3b82f6;color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}

/* PROFILE */
.prof-top{text-align:center;padding:28px 20px 20px}
.prof-av{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;margin:0 auto 10px}
.prof-name{font-size:22px;font-weight:700}
.prof-sub{font-size:12px;color:#94a3b8;margin-top:3px}
.prof-stats{display:flex;margin:0 20px 20px;background:#f8fafc;border-radius:16px;padding:16px 0}
.pst{flex:1;text-align:center}
.pst-v{font-size:20px;font-weight:700}
.pst-l{font-size:10px;color:#94a3b8;margin-top:2px;text-transform:uppercase}

.invite{margin:0 20px 16px;background:#f0fdf4;border-radius:16px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;cursor:pointer}
.inv-left{display:flex;align-items:center;gap:12px}
.inv-icon{font-size:28px}
.inv-t{font-size:14px;font-weight:600;color:#15803d}
.inv-s{font-size:12px;color:#16a34a}
.inv-btn{padding:8px 16px;background:#16a34a;color:#fff;border-radius:50px;font-size:12px;font-weight:600}

.menu{margin:0 20px;background:#f8fafc;border-radius:16px;overflow:hidden}
.mi{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #f1f5f9;font-size:14px}
.mi:last-child{border:none}
.mi-a{color:#cbd5e1;font-size:18px}
.mi-v{color:#94a3b8;font-size:13px}

.footer{text-align:center;padding:28px;font-size:14px;font-weight:600;color:#e2e8f0}
.footer span{font-size:10px;font-weight:400}

/* WELCOME SLIDES */
.welcome{height:100vh;display:flex;flex-direction:column;overflow:hidden;position:relative;background:#fff}
.w-slides{display:flex;transition:transform .4s cubic-bezier(.4,0,.2,1);height:calc(100% - 120px)}
.w-slide{min-width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 32px;text-align:center}
.w-visual{margin-bottom:32px}
.w-title{font-size:28px;font-weight:800;color:#0f172a;line-height:1.2;margin-bottom:12px}
.w-desc{font-size:15px;color:#64748b;line-height:1.5;max-width:300px}

/* Slide 1: Flow visual */
.w-circle{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.w-c1{background:#dbeafe}
.w-c2{background:#fef3c7}
.w-c3{background:#dcfce7}
.w-emoji{font-size:32px}
.w-visual:has(.w-circle){display:flex;align-items:center;gap:12px}
.w-arrow{font-size:20px;color:#cbd5e1;font-weight:300}

/* Slide 2: Companies */
.w-companies{display:flex;align-items:center;gap:10px}
.w-comp{font-size:48px}
.w-comp-arrow{font-size:20px;color:#94a3b8}
.w-comp-data{font-size:40px}

/* Slide 3: Shield */
.w-shield{display:flex;flex-direction:column;align-items:center;gap:8px}
.w-shield-icon{font-size:64px}
.w-shield-chain{font-size:13px;color:#3b82f6;font-weight:600;background:#eff6ff;padding:6px 16px;border-radius:50px}

/* Slide 4: Honest */
.w-honest{text-align:center}
.w-honest-icon{font-size:72px}

/* Controls */
.w-controls{padding:16px 32px 32px;display:flex;flex-direction:column;align-items:center;gap:12px}
.w-dots{display:flex;gap:6px;margin-bottom:8px}
.w-dot{width:8px;height:8px;border-radius:50%;background:#e2e8f0;cursor:pointer;transition:.2s}
.w-dot-on{background:#3b82f6;width:24px;border-radius:4px}
.w-next{width:100%;max-width:320px;padding:16px;background:#3b82f6;color:#fff;border:none;border-radius:50px;font-size:16px;font-weight:600;cursor:pointer;font-family:inherit;box-shadow:0 4px 16px rgba(59,130,246,.3)}
.w-next:active{transform:scale(.97)}
.w-start{background:linear-gradient(135deg,#3b82f6,#2563eb);box-shadow:0 6px 20px rgba(59,130,246,.35)}
.w-skip{background:none;border:none;color:#94a3b8;font-size:14px;cursor:pointer;font-family:inherit;padding:6px}

/* ONBOARDING */
.ob{min-height:100vh;display:flex;flex-direction:column;position:relative}
.ob-screen{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 32px;text-align:center}
.ob-ill{font-size:72px;margin-bottom:24px}
.ob-title{font-size:26px;font-weight:800;color:#1e293b;line-height:1.2;margin-bottom:10px}
.ob-sub{font-size:14px;color:#94a3b8;line-height:1.4;margin-bottom:32px;max-width:280px}
.ob-btn{width:100%;max-width:300px;padding:16px;background:#3b82f6;color:#fff;border:none;border-radius:50px;font-size:16px;font-weight:600;cursor:pointer;font-family:inherit;box-shadow:0 4px 16px rgba(59,130,246,.3);transition:transform .1s}
.ob-btn:active{transform:scale(.97)}
.ob-btn:disabled{opacity:.3}
.ob-skip{margin-top:12px;background:none;border:none;color:#94a3b8;font-size:14px;cursor:pointer;font-family:inherit;padding:8px}
.ob-options{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:28px}
.ob-opt{padding:14px 28px;border:2px solid #e2e8f0;border-radius:16px;background:#fff;font-size:16px;font-weight:600;color:#475569;cursor:pointer;font-family:inherit;transition:.15s}
.ob-opt:active{transform:scale(.95)}
.ob-opt-on{border-color:#3b82f6;background:#eff6ff;color:#2563eb}
.ob-opt-wide{flex:1;min-width:120px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:17px}
.ob-gender{max-width:300px}
.ob-dots{display:flex;gap:6px;justify-content:center;margin-top:28px}
.ob-dot{width:8px;height:8px;border-radius:50%;background:#e2e8f0}
.ob-dot-on{background:#3b82f6;width:24px;border-radius:4px}
.ob-lang{position:absolute;top:16px;right:16px;display:flex;background:#f1f5f9;border-radius:10px;overflow:hidden}

/* CAMERA */
.cam{position:fixed;inset:0;background:#000;z-index:200}
.cam-v{width:100%;height:100%;object-fit:cover}
.cam-ui{position:absolute;inset:0;display:flex;flex-direction:column}
.cam-top{padding:20px;display:flex;justify-content:flex-end}
.cam-x{width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,.4);backdrop-filter:blur(8px);border:none;color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.cam-mid{flex:1;display:flex;align-items:center;justify-content:center}
.cam-frame{width:300px;height:200px;position:relative}
.cf-corner{position:absolute;width:28px;height:28px;border-color:#fff;border-style:solid}
.cf-tl{top:0;left:0;border-width:3px 0 0 3px;border-radius:8px 0 0 0}
.cf-tr{top:0;right:0;border-width:3px 3px 0 0;border-radius:0 8px 0 0}
.cf-bl{bottom:0;left:0;border-width:0 0 3px 3px;border-radius:0 0 0 8px}
.cf-br{bottom:0;right:0;border-width:0 3px 3px 0;border-radius:0 0 8px 0}
.cam-hint{text-align:center;color:rgba(255,255,255,.7);font-size:15px;font-weight:500;padding:16px}
.cam-bot{display:flex;justify-content:center;padding:20px 0 44px}
.cam-shutter{width:76px;height:76px;border-radius:50%;background:transparent;border:4px solid rgba(255,255,255,.8);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .1s}
.cam-shutter:active{transform:scale(.9)}
.cam-dot{width:60px;height:60px;border-radius:50%;background:#fff}
.cam-shutter:disabled{opacity:.3}
.cam-err{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center;padding:40px}
.cam-err-t{font-size:18px;font-weight:600;margin-bottom:20px}
.cam-err-btn{padding:16px 32px;background:#3b82f6;color:#fff;border-radius:50px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit}
.cam-err-close{position:absolute;top:20px;right:20px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.1);border:none;color:#fff;font-size:20px;cursor:pointer}

/* NAV */
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;display:flex;background:rgba(255,255,255,.92);backdrop-filter:blur(16px);border-top:1px solid #f1f5f9;padding:6px 0 env(safe-area-inset-bottom,8px);z-index:50}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;border:none;background:none;color:#94a3b8;cursor:pointer;font-family:inherit;transition:.12s}
.nb span{font-size:10px;font-weight:500}
.nb-on{color:#3b82f6}
.nb-on svg{stroke:#3b82f6}
`
