/* ===== Học liệu (nội dung tĩnh của trang) ===== */
const SKILLS = {
  pron:   { vi: 'Phát âm', route: 'pronunciation' },
  vocab:  { vi: 'Từ vựng', route: 'vocabulary' },
  grammar:{ vi: 'Ngữ pháp', route: 'vocabulary' },
  listen: { vi: 'Nghe', route: 'listening' },
  speak:  { vi: 'Nói', route: 'practice' },
  ecom:   { vi: 'TMĐT', route: 'ecommerce' },
  review: { vi: 'Ôn tập', route: 'progress' }
};

/* 44 âm IPA: sym, nhóm (v: nguyên âm đơn, d: nguyên âm đôi, c: phụ âm), hữu thanh, ví dụ, cách phát âm, lỗi hay gặp, ưu tiên */
const SOUNDS = [
  ['iː','v',1,['see','team','need'],'Kéo môi sang hai bên như đang cười, lưỡi nâng cao phía trước, giữ âm dài.','Đọc ngắn như "i" tiếng Việt nên không phân biệt được với /ɪ/.',1],
  ['ɪ','v',1,['it','ship','listing'],'Âm ngắn, môi thả lỏng, lưỡi thấp hơn /iː/ một chút.','Kéo dài thành /iː/: "ship" nghe thành "sheep".',1],
  ['e','v',1,['sell','set','spend'],'Mở miệng vừa, môi hơi kéo ngang, gần âm "e" tiếng Việt nhưng gọn hơn.','Mở miệng quá rộng nên lẫn với /æ/.',0],
  ['æ','v',1,['ad','bad','campaign'],'Hạ hàm dưới thật thấp, lưỡi thấp phía trước; âm nằm giữa "a" và "e".','Đọc thành "e" hoặc "a": "bad" nghe như "bed".',1],
  ['ʌ','v',1,['up','cut','budget'],'Âm ngắn, miệng mở vừa, lưỡi ở giữa; gần âm "â" tiếng Việt.','Đọc thành "a" dài.',0],
  ['ɑː','v',1,['car','start','target'],'Mở miệng rộng, lưỡi thấp và lùi về sau, giữ âm dài.','Đọc ngắn như "a" tiếng Việt.',0],
  ['ɒ','v',1,['shop','stock','top'],'Âm ngắn, môi hơi tròn, miệng mở rộng.','Đọc thành "ô" khép.',0],
  ['ɔː','v',1,['order','store','call'],'Môi tròn, lưỡi lùi sau, giữ âm dài.','Đọc ngắn như "o" tiếng Việt.',0],
  ['ʊ','v',1,['book','good','look'],'Âm ngắn, môi tròn nhưng thả lỏng.','Kéo dài thành /uː/.',0],
  ['uː','v',1,['new','food','review'],'Môi tròn và chu ra phía trước, giữ âm dài.','Không chu môi đủ nên âm bị bẹt.',0],
  ['ɜː','v',1,['work','first','purchase'],'Môi thả lỏng, không tròn, lưỡi ở giữa, giữ âm dài.','Đọc thành "ơ" ngắn hoặc thêm âm "r" rung.',0],
  ['ə','v',1,['about','seller','percent'],'Âm yếu, rất ngắn, miệng thả lỏng; chỉ có ở âm tiết không nhấn.','Đọc rõ theo mặt chữ nên sai trọng âm.',1],
  ['eɪ','d',1,['sale','pay','rate'],'Bắt đầu ở /e/ rồi trượt nhanh sang /ɪ/.','Đọc thành một âm "ê": "sale" nghe như "sell".',1],
  ['aɪ','d',1,['price','buy','online'],'Bắt đầu ở /a/ rồi trượt sang /ɪ/.','Thiếu phần trượt cuối.',0],
  ['ɔɪ','d',1,['choice','voice','invoice'],'Bắt đầu ở /ɔː/ rồi trượt sang /ɪ/.','Đọc thành "oi" ngắn, thiếu độ tròn môi.',0],
  ['aʊ','d',1,['how','account','discount'],'Bắt đầu ở /a/, môi tròn dần khi trượt sang /ʊ/.','Đọc thành "ao" quá ngắn.',0],
  ['əʊ','d',1,['go','low','total'],'Bắt đầu ở /ə/, môi tròn dần khi trượt sang /ʊ/.','Đọc thành "ô" một âm.',0],
  ['ɪə','d',1,['here','year','clear'],'Bắt đầu ở /ɪ/ rồi trượt sang /ə/.','Đọc thành "ia" có âm "a" rõ.',0],
  ['eə','d',1,['share','care','there'],'Bắt đầu ở /e/ rồi trượt sang /ə/.','Đọc thành "e" rồi dừng.',0],
  ['ʊə','d',1,['tour','sure','pure'],'Bắt đầu ở /ʊ/ rồi trượt sang /ə/; nhiều người bản ngữ đọc gần /ɔː/.','Đọc thành "ua" có âm "a" rõ.',0],
  ['p','c',0,['pay','price','shop'],'Mím hai môi rồi bật hơi mạnh; đặt tờ giấy trước miệng, giấy phải rung.','Không bật hơi nên nghe thành /b/.',0],
  ['b','c',1,['buy','brand','budget'],'Mím hai môi, bật nhẹ, dây thanh rung.','Nuốt âm khi đứng cuối từ.',0],
  ['t','c',0,['top','cart','target'],'Đầu lưỡi chạm lợi trên rồi bật hơi; âm cuối phải nghe được.','Bỏ /t/ ở cuối từ: "cart" thành "car".',1],
  ['d','c',1,['deal','data','paid'],'Đầu lưỡi chạm lợi trên, dây thanh rung.','Bỏ /d/ cuối ở động từ quá khứ.',0],
  ['k','c',0,['cost','click','stock'],'Gốc lưỡi chạm ngạc mềm rồi bật hơi.','Bỏ /k/ cuối: "stock" thành "sto".',1],
  ['g','c',1,['goal','grow','bag'],'Như /k/ nhưng dây thanh rung.','Bỏ /g/ cuối từ.',0],
  ['f','c',0,['fee','offer','profit'],'Răng trên chạm nhẹ môi dưới, thổi hơi ra.','Đọc thành /p/ ở cuối từ.',0],
  ['v','c',1,['value','video','review'],'Như /f/ nhưng dây thanh rung, cảm nhận được độ rung ở môi.','Đọc thành "v" tiếng Việt quá nhẹ hoặc thành /f/.',0],
  ['θ','c',0,['think','three','month'],'Đặt đầu lưỡi nhẹ giữa hai hàm răng, đẩy hơi ra. Không thay bằng /t/ hoặc /s/.','Đọc thành "th" tiếng Việt (/t/) hoặc /s/.',1],
  ['ð','c',1,['this','the','other'],'Như /θ/ nhưng dây thanh rung.','Đọc thành "d" hoặc "z".',1],
  ['s','c',0,['sale','cost','sales'],'Đầu lưỡi gần lợi trên, hơi xì qua khe hẹp.','Bỏ /s/ ở danh từ số nhiều.',1],
  ['z','c',1,['zero','size','orders'],'Như /s/ nhưng dây thanh rung, nghe tiếng "zzz".','Đọc thành /s/ hoặc bỏ hẳn.',1],
  ['ʃ','c',0,['ship','shop','cash'],'Môi hơi chu tròn, lưỡi lùi ra sau lợi, hơi thoát ra rộng hơn /s/.','Đọc thành /s/: "ship" nghe như "sip".',1],
  ['ʒ','c',1,['usually','measure','decision'],'Như /ʃ/ nhưng dây thanh rung.','Đọc thành /z/ hoặc "d".',1],
  ['h','c',0,['how','high','half'],'Thở hơi nhẹ ra từ cổ họng.','Thêm âm "h" vào nơi không có, hoặc bỏ mất.',0],
  ['tʃ','c',0,['check','chat','purchase'],'Bắt đầu như /t/, rồi bật ra thành /ʃ/, môi hơi chu.','Đọc như "ch" tiếng Việt, không bật hơi.',1],
  ['dʒ','c',1,['job','page','budget'],'Như /tʃ/ nhưng dây thanh rung.','Đọc thành "gi" hoặc "d" tiếng Việt.',1],
  ['m','c',1,['market','team','item'],'Mím môi, hơi đi qua mũi.','Bỏ /m/ cuối từ.',0],
  ['n','c',1,['net','online','plan'],'Đầu lưỡi chạm lợi trên, hơi đi qua mũi.','Lẫn với /ŋ/ ở cuối từ.',0],
  ['ŋ','c',1,['thing','shopping','marketing'],'Gốc lưỡi chạm ngạc mềm, hơi đi qua mũi, như "ng".','Thêm /k/ hoặc /g/ sau "ng".',0],
  ['l','c',1,['list','sell','total'],'Đầu lưỡi chạm lợi trên; /l/ cuối từ phải giữ lưỡi ở vị trí đó.','Bỏ /l/ cuối hoặc đọc thành /n/.',1],
  ['r','c',1,['rate','return','revenue'],'Cong đầu lưỡi về sau, không chạm vòm miệng, môi hơi tròn.','Đọc thành "z" hoặc "r" rung.',1],
  ['w','c',1,['week','web','wallet'],'Chu môi tròn rồi mở nhanh.','Đọc thành "u" kéo dài.',0],
  ['j','c',1,['yes','year','user'],'Nâng lưỡi cao như /iː/ rồi trượt nhanh sang nguyên âm sau.','Bỏ /j/ trong "user", "new".',0]
].map(([sym,g,voiced,ex,tip,trap,pri]) => ({ sym, g, voiced, ex, tip, trap, pri }));
const SOUND_GROUPS = { v: 'Nguyên âm đơn', d: 'Nguyên âm đôi', c: 'Phụ âm' };

const PAIRS = [
  { a:'θ', b:'s', words:[['think','sink'],['thank','sank'],['mouth','mouse']] },
  { a:'θ', b:'t', words:[['three','tree'],['thin','tin'],['both','boat']] },
  { a:'ʃ', b:'s', words:[['ship','sip'],['sheet','seat'],['shell','sell']] },
  { a:'iː', b:'ɪ', words:[['sheep','ship'],['seat','sit'],['leave','live']] },
  { a:'æ', b:'e', words:[['bad','bed'],['man','men'],['sat','set']] },
  { a:'l', b:'r', words:[['light','right'],['lead','read'],['collect','correct']] },
  { a:'ð', b:'d', words:[['they','day'],['those','doze'],['then','den']] },
  { a:'s', b:'z', words:[['price','prize'],['place','plays'],['bus','buzz']] },
  { a:'f', b:'v', words:[['fan','van'],['few','view'],['safe','save']] },
  { a:'tʃ', b:'ʃ', words:[['chip','ship'],['cheap','sheep'],['watch','wash']] }
];

const STRESS = [
  ['revenue',['re','ve','nue'],0],['analytics',['an','a','lyt','ics'],2],['conversion',['con','ver','sion'],1],
  ['customer',['cus','to','mer'],0],['delivery',['de','liv','er','y'],1],['company',['com','pa','ny'],0],
  ['promotion',['pro','mo','tion'],1],['inventory',['in','ven','to','ry'],0],['marketing',['mar','ke','ting'],0],
  ['percentage',['per','cen','tage'],1],['average',['av','er','age'],0],['commission',['com','mis','sion'],1],
  ['e-commerce',['e','com','merce'],1],['campaign',['cam','paign'],1],['invoice',['in','voice'],0],
  ['discount',['dis','count'],0],['engagement',['en','gage','ment'],1],['affiliate',['af','fil','i','ate'],1],
  ['category',['cat','e','go','ry'],0],['economy',['e','con','o','my'],1]
].map(([w,syl,s]) => ({ w, syl, s }));

const ENDINGS = {
  s: { title: 'Đuôi -s / -es', opts: ['/s/','/z/','/ɪz/'], rules: [
      ['/s/','Sau âm vô thanh /p/, /t/, /k/, /f/, /θ/','shops, carts, clicks, months'],
      ['/z/','Sau âm hữu thanh và nguyên âm','orders, sales, reviews, pays'],
      ['/ɪz/','Sau /s/, /z/, /ʃ/, /tʃ/, /dʒ/','prices, boxes, wishes, packages']],
    items: [['shops',0],['carts',0],['clicks',0],['months',0],['orders',1],['sales',1],['reviews',1],['plays',1],['prices',2],['boxes',2],['packages',2],['matches',2]] },
  ed: { title: 'Đuôi -ed', opts: ['/t/','/d/','/ɪd/'], rules: [
      ['/t/','Sau âm vô thanh /p/, /k/, /s/, /ʃ/, /tʃ/, /f/','shipped, checked, increased, finished'],
      ['/d/','Sau âm hữu thanh và nguyên âm','ordered, delivered, returned, played'],
      ['/ɪd/','Sau /t/ và /d/','added, updated, ended, posted']],
    items: [['shipped',0],['checked',0],['increased',0],['finished',0],['ordered',1],['delivered',1],['returned',1],['called',1],['added',2],['updated',2],['ended',2],['posted',2]] }
};

/* Ngữ pháp: thứ tự học từ g1 đến g7 */
const GRAMMAR = [
  { id:'g1', title:'Đại từ và động từ to be', goal:'Giới thiệu bản thân, mô tả người và vật bằng am / is / are.',
    theory:['I + am · He / She / It + is · You / We / They + are','Phủ định: am not, is not (isn\'t), are not (aren\'t)','Câu hỏi: đưa to be lên đầu câu: Are you…? Is it…?'],
    ex:['I am an e-commerce planner.','She is my manager.','We are on the sales team.','The price is not high.','Are you busy now?'],
    qs:[['I ___ a seller on Shopee.',['am','is','are','be'],0,'Dùng "am" với "I".'],
        ['She ___ my colleague.',['am','is','are','be'],1,'Dùng "is" với he / she / it.'],
        ['They ___ my friends.',['am','is','are','be'],2,'Dùng "are" với they.'],
        ['The shipping fee ___ free today.',['am','is','are','be'],1,'"The shipping fee" là danh từ số ít, tương đương "it".'],
        ['___ you available tomorrow?',['Am','Is','Are','Be'],2,'Câu hỏi với "you" bắt đầu bằng "Are".'],
        ['We ___ not ready for the meeting.',['am','is','are','be'],2,'Dùng "are" với we.']],
    write:'Viết 3 câu về bản thân và công việc, có dùng am / is / are.' },
  { id:'g2', title:'Danh từ số ít, số nhiều và mạo từ', goal:'Dùng đúng a / an / the và dạng số nhiều khi nói về sản phẩm, đơn hàng.',
    theory:['a + âm phụ âm: a shop, a campaign · an + âm nguyên âm (theo cách đọc): an order, an hour','the: vật đã xác định, cả hai bên đều biết: the report','Số nhiều: thêm -s (orders); thêm -es sau s, x, sh, ch (boxes, dishes)','Bất quy tắc: person → people, child → children','Không đếm được: money, information, data: không thêm -s, không dùng a / an'],
    ex:['I have an order from Hanoi.','The report is on my desk.','We sold fifty boxes today.','Many people buy on TikTok Shop.','Please send me the information.'],
    qs:[['I have ___ email from a customer.',['a','an','the','–'],1,'"email" bắt đầu bằng âm nguyên âm /iː/.'],
        ['This is ___ new product.',['a','an','the','–'],0,'"new" bắt đầu bằng âm phụ âm /n/.'],
        ['We sold 50 ___ today.',['box','boxs','boxes','boxies'],2,'Danh từ tận cùng bằng x thêm -es.'],
        ['Many ___ shop online at night.',['person','persons','peoples','people'],3,'Số nhiều của person là people.'],
        ['Please send me the ___.',['informations','information','an information','a information'],1,'information không đếm được.'],
        ['___ report for this week is ready.',['A','An','The','–'],2,'Báo cáo đã xác định (của tuần này) nên dùng the.']],
    write:'Viết 3 câu về sản phẩm hoặc đơn hàng của bạn, có dùng a / an / the và một danh từ số nhiều.' },
  { id:'g3', title:'Thì hiện tại đơn', goal:'Nói về thói quen, lịch làm việc và công việc hằng ngày.',
    theory:['Dùng cho thói quen, sự thật, lịch cố định.','I / You / We / They + V: I work. · He / She / It + V-s/es: She works, he watches.','Phủ định: don\'t / doesn\'t + V nguyên mẫu','Câu hỏi: Do / Does + chủ ngữ + V?','Từ chỉ tần suất: always, usually, often, sometimes, never; every day'],
    ex:['I check orders every morning.','She manages the ads.',"We don't sell on Lazada.",'Does he work on weekends?'],
    qs:[['She ___ the sales report every Monday.',['send','sends','sending','is send'],1,'Chủ ngữ she: động từ thêm -s.'],
        ['I usually ___ work at 8:30.',['starts','start','starting','am start'],1,'Chủ ngữ I: giữ nguyên động từ.'],
        ['He ___ work on Sunday.',["don't","doesn't","isn't",'not'],1,'Phủ định với he dùng doesn\'t + V.'],
        ['___ you sell on TikTok Shop?',['Does','Do','Are','Is'],1,'Câu hỏi với you dùng Do.'],
        ['The shop ___ at 9 a.m.',['open','opens','opening','to open'],1,'"The shop" tương đương it: opens.'],
        ['My team ___ a meeting every Friday.',['have','has','having','haves'],1,'Have với he / she / it là has.']],
    write:'Viết 3 câu về một ngày làm việc của bạn, dùng thì hiện tại đơn.' },
  { id:'g4', title:'Câu hỏi Wh- và câu hỏi Yes/No', goal:'Hỏi thông tin và trả lời ngắn trong công việc.',
    theory:['What: cái gì · Where: ở đâu · When: khi nào · Who: ai','How many + danh từ đếm được · How much + không đếm được hoặc giá tiền','Câu hỏi Wh-: Wh- + do / does / to be + chủ ngữ…? (Where do you work?)','Câu hỏi Yes/No: Do / Does / Is / Are + chủ ngữ…? Trả lời: Yes, I do. / No, it isn\'t.'],
    ex:['What do you do?','Where is the warehouse?','How many orders do we have today?','How much is this voucher?','Is the item in stock? Yes, it is.'],
    qs:[['___ do you work? At a cosmetics company.',['What','Where','When','Who'],1,'Hỏi nơi chốn dùng Where.'],
        ['___ orders did we get today? 120.',['How much','How many','What many','How'],1,'orders đếm được nên dùng How many.'],
        ['___ is this shampoo? 150,000 dong.',['How much','How many','What','Where'],0,'Hỏi giá dùng How much.'],
        ['___ does the campaign start? At 8 p.m.',['When','Who','Where','How many'],0,'Hỏi thời gian dùng When.'],
        ['Do you work on Saturday? Yes, I ___.',['am','do','does','work'],1,'Câu hỏi bằng Do thì trả lời ngắn bằng do.'],
        ['___ is your manager? Ms. Lan.',['Who','What','Where','When'],0,'Hỏi người dùng Who.']],
    write:'Viết 3 câu hỏi bạn muốn hỏi một khách hàng hoặc đồng nghiệp.' },
  { id:'g5', title:'Thì hiện tại tiếp diễn', goal:'Nói về việc đang làm lúc này hoặc trong tuần này.',
    theory:['Diễn tả việc đang xảy ra lúc nói hoặc trong giai đoạn hiện tại.','Chủ ngữ + am / is / are + V-ing','Dấu hiệu: now, right now, at the moment, this week','Thêm -ing: make → making, run → running, check → checking','Không dùng với động từ trạng thái: like, want, know, need'],
    ex:['I am checking the orders now.','She is writing the report.','We are running a flash sale this week.','Are you talking to a customer?'],
    qs:[['I ___ the stock right now.',['check','am checking','checks','checking'],1,'Đang làm lúc nói: am + V-ing.'],
        ['They ___ a livestream at the moment.',['have','are having','has','is having'],1,'They + are + V-ing.'],
        ['She ___ an email now.',['writes','is writing','is writeing','write'],1,'write bỏ e trước khi thêm -ing.'],
        ['We ___ a new campaign this week.',['run','are running','are runing','runs'],1,'run gấp đôi n: running.'],
        ['___ he talking to the supplier?',['Is','Are','Does','Do'],0,'Câu hỏi với he: Is + he + V-ing.'],
        ['Chọn câu đúng.',['I am wanting a coffee.','I want a coffee.','I wanting a coffee.','I am want a coffee.'],1,'want là động từ trạng thái, không dùng dạng -ing.']],
    write:'Viết 3 câu về những việc bạn hoặc nhóm đang làm trong tuần này.' },
  { id:'g6', title:'Thì quá khứ đơn', goal:'Kể lại kết quả và việc đã làm.',
    theory:['Diễn tả việc đã xảy ra và kết thúc trong quá khứ.','Có quy tắc: thêm -ed (order → ordered, ship → shipped)','Bất quy tắc: go → went, buy → bought, sell → sold, send → sent, have → had, make → made','Phủ định: didn\'t + V nguyên mẫu · Câu hỏi: Did + chủ ngữ + V?','Dấu hiệu: yesterday, last week, ago, in 2025'],
    ex:['We sold 300 items yesterday.','I sent the report last Friday.',"The customer didn't receive the order.",'Did you call the supplier?'],
    qs:[['We ___ 500 orders last week.',['receive','received','receives','receiving'],1,'last week: quá khứ, động từ thêm -ed.'],
        ['I ___ the price list yesterday.',['send','sended','sent','sends'],2,'send là động từ bất quy tắc: sent.'],
        ['She ___ a new phone last month.',['buyed','bought','buys','buy'],1,'buy → bought.'],
        ['The customer ___ like the color.',["don't","didn't","doesn't",'not'],1,'Phủ định quá khứ: didn\'t + V.'],
        ['___ you finish the report?',['Do','Does','Did','Were'],2,'Câu hỏi quá khứ: Did + chủ ngữ + V.'],
        ['Sales ___ by 10% last month.',['increase','increased','increasing','increases'],1,'last month: increased.']],
    write:'Viết 3 câu kể lại công việc bạn đã làm hôm qua.' },
  { id:'g7', title:'Giới từ thời gian, nơi chốn và cấu trúc câu cơ bản', goal:'Nói đúng giờ, ngày, địa điểm và trật tự câu.',
    theory:['at + giờ: at 8 p.m. · on + thứ / ngày: on Monday, on 12 October · in + tháng / năm / buổi: in October, in 2026, in the morning','Nơi chốn: in + thành phố / phòng (in Ho Chi Minh City) · at + địa điểm cụ thể (at work, at the office) · on + bề mặt / đường / tầng (on the second floor)','Trật tự câu: Chủ ngữ + Động từ + Tân ngữ + Nơi chốn + Thời gian','I (chủ ngữ) send (động từ) the report (tân ngữ) to my manager every Monday (thời gian).'],
    ex:['The campaign starts at 8 p.m. on Friday.','I work in Ho Chi Minh City.','The meeting is in the morning.','Our warehouse is on Le Loi Street.'],
    qs:[['The flash sale starts ___ 8 p.m.',['in','on','at','by'],2,'Giờ cụ thể dùng at.'],
        ['We have a meeting ___ Monday.',['in','on','at','to'],1,'Thứ trong tuần dùng on.'],
        ['Our office is ___ Ho Chi Minh City.',['in','on','at','to'],0,'Thành phố dùng in.'],
        ['I usually check orders ___ the morning.',['in','on','at','by'],0,'Buổi trong ngày dùng in the morning.'],
        ['The new products arrive ___ 15 October.',['in','on','at','of'],1,'Ngày cụ thể dùng on.'],
        ['Chọn câu có trật tự đúng.',['I every day check orders.','I check orders every day.','Check I orders every day.','I check every day orders.'],1,'Chủ ngữ + động từ + tân ngữ + thời gian.']],
    write:'Viết 3 câu về lịch làm việc của bạn, có dùng at / on / in.' }
];

/* Bài nghe: [tiếng Anh, tiếng Việt]; số viết bằng chữ để chép chính tả công bằng */
const LISTEN = [
  { id:'l1', title:'Introducing yourself at work', vi:'Giới thiệu bản thân ở nơi làm việc', lines:[
    ['Hello, my name is Alex.','Xin chào, tôi tên là Alex.'],
    ['I work in e-commerce.','Tôi làm trong ngành thương mại điện tử.'],
    ['I manage online sales and advertising campaigns.','Tôi quản lý bán hàng trực tuyến và các chiến dịch quảng cáo.'],
    ['Nice to meet you.','Rất vui được gặp bạn.']] },
  { id:'l2', title:'My daily routine', vi:'Một ngày của tôi', lines:[
    ['I usually get up at six thirty.','Tôi thường dậy lúc sáu giờ rưỡi.'],
    ['I check new orders before breakfast.','Tôi kiểm tra đơn hàng mới trước bữa sáng.'],
    ['I go to work by motorbike.','Tôi đi làm bằng xe máy.'],
    ['In the afternoon, I have a team meeting.','Buổi chiều, tôi họp nhóm.']] },
  { id:'l3', title:'At a coffee shop', vi:'Ở quán cà phê', lines:[
    ['Can I have an iced coffee, please?','Cho tôi một ly cà phê đá nhé.'],
    ['Small or large?','Ly nhỏ hay ly lớn?'],
    ['Large, please. How much is it?','Ly lớn. Bao nhiêu tiền vậy?'],
    ["It's forty-five thousand dong.",'Bốn mươi lăm nghìn đồng.']] },
  { id:'l4', title:'A short sales update', vi:'Cập nhật doanh số ngắn', lines:[
    ['Revenue this week is one hundred and twenty-five million dong.','Doanh thu tuần này là một trăm hai mươi lăm triệu đồng.'],
    ['We received one thousand two hundred and fifty orders.','Chúng tôi nhận được một nghìn hai trăm năm mươi đơn hàng.'],
    ['The conversion rate is three point five percent.','Tỷ lệ chuyển đổi là ba phẩy năm phần trăm.'],
    ['Sales increased by ten percent compared to last week.','Doanh số tăng mười phần trăm so với tuần trước.']] },
  { id:'l5', title:'Talking to a customer', vi:'Trao đổi với khách hàng', lines:[
    ['Hello, how can I help you?','Xin chào, tôi có thể giúp gì cho bạn?'],
    ['My order is late.','Đơn hàng của tôi bị trễ.'],
    ['Can you give me your order number, please?','Bạn cho tôi xin mã đơn hàng nhé?'],
    ['Thank you. I will check it for you now.','Cảm ơn bạn. Tôi sẽ kiểm tra ngay.']] },
  { id:'l6', title:'Asking for directions', vi:'Hỏi đường', lines:[
    ['Excuse me, where is the post office?','Xin lỗi, bưu điện ở đâu ạ?'],
    ['Go straight and turn left.','Đi thẳng rồi rẽ trái.'],
    ['It is next to the bank.','Nó ở cạnh ngân hàng.'],
    ['Thank you very much.','Cảm ơn bạn rất nhiều.']] }
];

const DIALOGS = [
  { id:'d1', title:'Gặp đồng nghiệp mới', lines:[['A',"Hi, I'm Mai. I'm new here."],['B',"Hi Mai, nice to meet you. I'm Nam."],['A','What do you do, Nam?'],['B','I work in e-commerce. I manage our online shops.'],['A','That sounds interesting!']] },
  { id:'d2', title:'Mua hàng ở cửa hàng', lines:[['A','Hello, can I help you?'],['B','Yes, how much is this bag?'],['A',"It's three hundred thousand dong."],['B','Can I pay by card?'],['A','Sure.']] },
  { id:'d3', title:'Hỏi đường', lines:[['A','Excuse me, where is the bus station?'],['B','Go straight and turn right at the bank.'],['A','Is it far?'],['B',"No, it's about five minutes on foot."],['A','Thank you!']] },
  { id:'d4', title:'Cập nhật công việc nhanh', lines:[['A','Hi Nam, how are the sales today?'],['B','Good. We have two hundred orders so far.'],['A','Great. Is the voucher working?'],['B','Yes, it is. Many customers are using it.'],['A','Thanks for the update.']] }
];

const SPEAK_QS = [
  ['What do you do?','Bạn làm nghề gì?','I work in e-commerce. I am an e-commerce planner.'],
  ['What are your responsibilities?','Bạn phụ trách những việc gì?','I manage online sales on Shopee and TikTok Shop.'],
  ['What do you do every day?','Hằng ngày bạn làm gì?','I check orders, answer customers and read sales reports.'],
  ['Where do you work?','Bạn làm việc ở đâu?','I work at a cosmetics company in Ho Chi Minh City.'],
  ['What time do you start work?','Bạn bắt đầu làm việc lúc mấy giờ?','I start work at eight thirty.'],
  ['What do you usually do on weekends?','Cuối tuần bạn thường làm gì?','I usually visit my family and cook dinner.'],
  ['What did you do yesterday?','Hôm qua bạn đã làm gì?','I sent the sales report and had a meeting.'],
  ['Can you describe a product you sell?','Hãy mô tả một sản phẩm bạn bán.','It is a shampoo. It is good for dry hair. It costs one hundred and fifty thousand dong.']
];

/* Tiếng Anh TMĐT: các module tăng dần độ khó */
const ECOM_MODS = [
  { id:'m1', title:'Đọc số và tiền tệ', level:'Làm quen', desc:'Đọc số lớn, phần trăm, tiền VND bằng tiếng Anh.' },
  { id:'m2', title:'Thuật ngữ chỉ số', level:'Làm quen', desc:'GMV, AOV, CTR, ROAS… nghĩa và cách đọc.' },
  { id:'m3', title:'Đọc báo cáo bán hàng', level:'Cơ bản', desc:'Đọc bảng số liệu và trả lời bằng câu đơn giản.' },
  { id:'m4', title:'So sánh kỳ', level:'Cơ bản', desc:'Tăng, giảm, giữ nguyên so với tuần trước.' },
  { id:'m5', title:'Câu dùng cho quảng cáo và đơn hàng', level:'Mở rộng', desc:'Mẫu câu thường gặp trên Shopee, TikTok Shop.' }
];
const NUM_ITEMS = ['1,250','45,000 VND','3.5%','125,000,000 VND','980','12.5%','2,400,000 VND','0.8%'];
const TERMS = [
  ['GMV','Gross Merchandise Value','Tổng giá trị hàng hóa bán ra (trước hoàn, hủy)','G-M-V','Our GMV this month is two billion dong.'],
  ['NMV','Net Merchandise Value','Giá trị hàng bán ròng (sau hoàn, hủy)','N-M-V','NMV is lower than GMV because of returns.'],
  ['Revenue','Revenue','Doanh thu','REV-uh-nyoo','Revenue increased by ten percent.'],
  ['Orders','Orders','Số đơn hàng','OR-derz','We received one thousand orders today.'],
  ['AOV','Average Order Value','Giá trị trung bình mỗi đơn','A-O-V','The AOV is two hundred thousand dong.'],
  ['CR','Conversion Rate','Tỷ lệ chuyển đổi (đơn hàng / lượt truy cập)','conversion rate','The conversion rate is three percent.'],
  ['CTR','Click-Through Rate','Tỷ lệ nhấp (lượt nhấp / lượt hiển thị)','C-T-R','This ad has a high CTR.'],
  ['ROAS','Return on Ad Spend','Doanh thu trên chi phí quảng cáo','ROH-as','Our ROAS is six point two five.'],
  ['ACoS','Advertising Cost of Sales','Chi phí quảng cáo / doanh thu quảng cáo (Amazon)','AY-kos','The ACoS is sixteen percent.'],
  ['Ad spend','Ad spend','Chi phí quảng cáo','ad spend','Ad spend was twenty million dong.'],
  ['Return rate','Return rate','Tỷ lệ hoàn hàng','return rate','The return rate is two percent.'],
  ['Visitors','Visitors / Traffic','Lượt truy cập','VIZ-i-terz','We had thirty-five thousand visitors.']
];
const REPORT = { rows:[['Revenue','125,000,000 VND'],['Orders','1,250'],['Visitors','35,700'],['Conversion rate','3.5%'],['Ad spend','20,000,000 VND']] };
const REPORT_QS = [
  ['How many orders did the store receive?',['The store received one hundred and twenty-five orders.','The store received one thousand two hundred and fifty orders.','The store received twelve thousand five hundred orders.'],1,'1,250 = one thousand two hundred and fifty.'],
  ['What is the conversion rate?',['It is three point five percent.','It is thirty-five percent.','It is three point five percents.'],0,'3.5% đọc là "three point five percent"; percent không thêm -s.'],
  ['How much did the store spend on ads?',['Two million dong.','Twenty million dong.','Two hundred million dong.'],1,'20,000,000 = twenty million.'],
  ['What is the average order value (revenue ÷ orders)?',['Ten thousand dong.','One hundred thousand dong.','One million dong.'],1,'125,000,000 ÷ 1,250 = 100,000 VND.'],
  ['What is the ROAS (revenue ÷ ad spend)?',['Six point two five.','Sixty-two point five.','Zero point one six.'],0,'125,000,000 ÷ 20,000,000 = 6.25.']
];
const COMPARE = { rows:[['Revenue','100,000,000 VND','125,000,000 VND','+25%'],['Orders','1,000','1,250','+25%'],['Conversion rate','4.0%','3.5%','−0.5 điểm %'],['Ad spend','16,000,000 VND','20,000,000 VND','+25%'],['ROAS','6.25','6.25','0']] };
const COMPARE_PATTERNS = [
  ['Revenue increased by 25% compared to last week.','Doanh thu tăng 25% so với tuần trước.'],
  ['Orders went up from 1,000 to 1,250.','Đơn hàng tăng từ 1.000 lên 1.250.'],
  ['The conversion rate decreased slightly.','Tỷ lệ chuyển đổi giảm nhẹ.'],
  ['ROAS stayed the same.','ROAS giữ nguyên.'],
  ['Ad spend was higher than last week.','Chi phí quảng cáo cao hơn tuần trước.']
];
const COMPARE_QS = [
  ['Revenue: 100,000,000 → 125,000,000 VND. Chọn câu đúng.',['Revenue decreased by 25%.','Revenue increased by 25%.','Revenue stayed the same.'],1,'Tăng dùng increased by.'],
  ['ROAS: 6.25 → 6.25. Chọn câu đúng.',['ROAS went up.','ROAS went down.','ROAS stayed the same.'],2,'Không đổi: stayed the same.'],
  ['Conversion rate: 4.0% → 3.5%. Chọn câu đúng.',['The conversion rate increased.','The conversion rate decreased slightly.','The conversion rate doubled.'],1,'Giảm nhẹ: decreased slightly.'],
  ['Orders: 1,000 → 1,250. Chọn câu đúng.',['Orders went up from 1,000 to 1,250.','Orders went up to 1,000 from 1,250.','Orders went down from 1,000 to 1,250.'],0,'went up from A to B.'],
  ['Ad spend: 16,000,000 → 20,000,000 VND. Chọn câu đúng.',['Ad spend was lower than last week.','Ad spend was higher than last week.','Ad spend is the same as last week.'],1,'Lớn hơn: higher than.']
];
const ADS_PHRASES = [
  ['Your order has been confirmed.','Đơn hàng của bạn đã được xác nhận.'],
  ['Your order has been shipped.','Đơn hàng của bạn đã được gửi đi.'],
  ['This item is out of stock.','Sản phẩm này đã hết hàng.'],
  ['The campaign starts at 8 p.m.','Chiến dịch bắt đầu lúc 8 giờ tối.'],
  ['We increased the daily budget.','Chúng tôi đã tăng ngân sách ngày.'],
  ['This ad has a high click-through rate.','Quảng cáo này có tỷ lệ nhấp cao.'],
  ['Please check the stock before the flash sale.','Vui lòng kiểm tra tồn kho trước flash sale.'],
  ['The customer requested a refund.','Khách hàng đã yêu cầu hoàn tiền.'],
  ['Free shipping for orders over 300,000 dong.','Miễn phí vận chuyển cho đơn trên 300.000 đồng.'],
  ['Thank you for your order!','Cảm ơn bạn đã đặt hàng!']
];

/* Tình huống thực tế, mỗi tình huống 3 cấp */
const REAL = [
  { id:'r1', title:'Giới thiệu bản thân, gia đình và công việc',
    l1:[['Hi, I\'m Linh.','Xin chào, tôi là Linh.'],["I'm from Ho Chi Minh City.",'Tôi đến từ TP. Hồ Chí Minh.'],['I work in e-commerce.','Tôi làm trong ngành thương mại điện tử.'],['I manage online sales on Shopee and TikTok Shop.','Tôi quản lý bán hàng trực tuyến trên Shopee và TikTok Shop.'],['I live with my parents and my sister.','Tôi sống cùng bố mẹ và em gái.']],
    l2:{ text:"Hi, I'm {name}. I'm from {city}. I work at {company}. I'm {job}. I live with {family}.", fields:[['name','Tên','Quan'],['city','Thành phố','Ho Chi Minh City'],['company','Nơi làm việc','a cosmetics company'],['job','Công việc','an e-commerce planner'],['family','Sống cùng ai','my family']] },
    l3:['What\'s your name?','Where are you from?','What do you do?','What are your responsibilities?','What do you do every day?'] },
  { id:'r2', title:'Hỏi đường, mua sắm, gọi món và đặt dịch vụ',
    l1:[['Excuse me, where is the nearest pharmacy?','Xin lỗi, hiệu thuốc gần nhất ở đâu?'],['How much is this shirt?','Cái áo này bao nhiêu tiền?'],['Can I have a bowl of pho, please?','Cho tôi một tô phở nhé.'],["I'd like to book a table for two at seven.",'Tôi muốn đặt bàn cho hai người lúc bảy giờ.'],['Can I pay by card?','Tôi trả bằng thẻ được không?']],
    l2:{ text:"Can I have {food}, please? How much is {item}? I'd like to book {service} for {time}.", fields:[['food','Món ăn / đồ uống','an iced coffee'],['item','Món đồ muốn hỏi giá','this bag'],['service','Dịch vụ','a table for two'],['time','Thời gian','seven p.m.']] },
    l3:['What would you like to order?','How would you like to pay?','How many people?','Can I help you?'] },
  { id:'r3', title:'Lịch trình, sở thích và thói quen',
    l1:[['I usually get up at six thirty.','Tôi thường dậy lúc 6 giờ 30.'],['I start work at eight thirty.','Tôi bắt đầu làm việc lúc 8 giờ 30.'],['On weekends, I go to the gym.','Cuối tuần, tôi đi tập gym.'],['I like cooking and watching movies.','Tôi thích nấu ăn và xem phim.'],['I study English every evening.','Tôi học tiếng Anh mỗi tối.']],
    l2:{ text:'I usually get up at {time}. I start work at {start}. In my free time, I like {hobby}. On weekends, I {weekend}.', fields:[['time','Giờ dậy','six thirty'],['start','Giờ làm','eight thirty'],['hobby','Sở thích (V-ing)','cooking'],['weekend','Việc cuối tuần','visit my family']] },
    l3:['What time do you get up?','What do you do in your free time?','What do you do on weekends?','How often do you study English?'] },
  { id:'r4', title:'Đặt câu hỏi, nhờ giúp đỡ và xác nhận thông tin',
    l1:[['Could you repeat that, please?','Bạn nhắc lại được không?'],['Sorry, can you speak more slowly?','Xin lỗi, bạn nói chậm hơn được không?'],['Can you help me with this?','Bạn giúp tôi việc này được không?'],['Just to confirm, the meeting is at 3 p.m., right?','Cho tôi xác nhận lại, cuộc họp lúc 3 giờ chiều phải không?'],['How do you spell that?','Từ đó đánh vần thế nào?']],
    l2:{ text:'Just to confirm, {thing} is {detail}, right? Can you help me with {task}?', fields:[['thing','Thông tin cần xác nhận','the delivery'],['detail','Chi tiết','on Friday'],['task','Việc cần nhờ','the price list']] },
    l3:['Bạn không nghe rõ. Hãy nhờ đối phương nói lại.','Xác nhận lại: hàng được giao vào thứ Sáu.','Nhờ đồng nghiệp giúp kiểm tra tồn kho.','Hỏi cách đánh vần tên một khách hàng.'] },
  { id:'r5', title:'Giao tiếp nơi làm việc và cuộc họp ngắn',
    l1:[['Good morning, everyone.','Chào buổi sáng mọi người.'],["Let's start the meeting.",'Chúng ta bắt đầu họp nhé.'],['Here is the sales update for this week.','Đây là cập nhật doanh số tuần này.'],['I think we should increase the ad budget.','Tôi nghĩ chúng ta nên tăng ngân sách quảng cáo.'],['Any questions?','Có ai có câu hỏi không?']],
    l2:{ text:'This week, our revenue is {revenue}. We received {orders} orders. Next week, we plan to {plan}.', fields:[['revenue','Doanh thu (bằng chữ)','one hundred million dong'],['orders','Số đơn (bằng chữ)','one thousand'],['plan','Kế hoạch tuần sau','run a flash sale']] },
    l3:['Hãy mở đầu một cuộc họp ngắn.','Báo cáo một con số của tuần này.','Đưa ra một đề xuất đơn giản.','Kết thúc cuộc họp.'] },
  { id:'r6', title:'Viết tin nhắn, email và cập nhật công việc',
    l1:[['Hi Lan, the report is ready.','Chào Lan, báo cáo đã xong rồi.'],['Please check the attached file.','Bạn xem file đính kèm nhé.'],['I will send the price list by 5 p.m.','Tôi sẽ gửi bảng giá trước 5 giờ chiều.'],['Thank you for your help.','Cảm ơn bạn đã giúp.'],['Best regards, Minh','Trân trọng, Minh']],
    l2:{ text:'Hi {person}, {update}. I will {next} by {time}. Thanks, {name}', fields:[['person','Người nhận','Lan'],['update','Cập nhật','the new listings are online'],['next','Việc tiếp theo','send the report'],['time','Hạn','Friday'],['name','Tên bạn','Quan']] },
    l3:['Viết tin nhắn báo quản lý: báo cáo đã xong.','Viết email ngắn hỏi nhà cung cấp về hàng tồn kho.','Cập nhật công việc: bạn đã đăng 5 sản phẩm mới.'] }
];

const CAN_DO = [
  'Tự giới thiệu bản thân và công việc trong 1 phút',
  'Đọc đúng một bảng số liệu ngắn (doanh thu, đơn hàng, %)',
  'Phát âm rõ âm cuối /s/, /t/, /k/',
  'Gọi món hoặc mua hàng bằng tiếng Anh',
  'Hỏi lại khi không nghe rõ',
  'Viết tin nhắn cập nhật công việc 2–3 câu',
  'Hiểu 10 thuật ngữ TMĐT trên Seller Center',
  'Trả lời câu hỏi "What do you do every day?"'
];

/* Lộ trình 12 tuần: âm, ngữ pháp, chủ đề từ, bài nghe, module TMĐT, tình huống */
const WEEK_PLAN = [
  { s:['iː','ɪ','e','æ'], g:'g1', t:'basic', l:'l1', m:'m1', r:'r1' },
  { s:['ʌ','ɑː','ɒ','ɔː'], g:'g1', t:'people', l:'l2', m:'m1', r:'r1' },
  { s:['ʊ','uː','ɜː','ə'], g:'g2', t:'daily', l:'l3', m:'m2', r:'r3' },
  { s:['eɪ','aɪ','ɔɪ','aʊ'], g:'g3', t:'time', l:'l2', m:'m2', r:'r3' },
  { s:['əʊ','ɪə','eə','ʊə'], g:'g3', t:'food', l:'l5', m:'m3', r:'r4' },
  { s:['p','b','t','d'], g:'g4', t:'places', l:'l3', m:'m3', r:'r4' },
  { s:['k','g','f','v'], g:'g4', t:'describe', l:'l4', m:'m4', r:'r2' },
  { s:['θ','ð','s','z'], g:'g5', t:'work', l:'l6', m:'m4', r:'r2' },
  { s:['ʃ','ʒ','tʃ','dʒ'], g:'g6', t:'comm', l:'l5', m:'m5', r:'r5' },
  { s:['h','m','n','ŋ'], g:'g6', t:'numbers', l:'l4', m:'m5', r:'r5' },
  { s:['l','r','w','j'], g:'g7', t:'ecom', l:'l1', m:'m3', r:'r6' },
  { s:['θ','ʃ','r','l'], g:'g7', t:'marketing', l:'l4', m:'m4', r:'r6' }
];

function buildWeekBlocks(weekIdx, monday, addDaysFn, mkId) {
  const p = WEEK_PLAN[weekIdx]; const gt = GRAMMAR.find(g => g.id === p.g).title;
  const lt = LISTEN.find(l => l.id === p.l).title; const mt = ECOM_MODS.find(m => m.id === p.m).title;
  const rt = REAL.find(r => r.id === p.r).title; const top = VOCAB_TOPICS[p.t];
  const sl = a => a.map(x => '/' + x + '/').join(', ');
  const days = [
    [['vocab','Học 14 từ mới: ' + top,'vocabulary'],['pron','Luyện âm ' + sl(p.s.slice(0,2)),'pronunciation'],['grammar','Ngữ pháp: ' + gt,'vocabulary'],['listen','Nghe chậm: ' + lt,'listening'],['ecom','Đọc 5 số liệu: ' + mt,'ecommerce']],
    [['vocab','Học 14 từ mới: ' + top,'vocabulary'],['pron','Luyện âm ' + sl(p.s.slice(2)),'pronunciation'],['grammar','Ngữ pháp: bài tập ' + gt,'vocabulary'],['listen','Chép chính tả: ' + lt,'listening'],['ecom','Thuật ngữ TMĐT','ecommerce']],
    [['vocab','Học 14 từ mới: ' + top,'vocabulary'],['pron','Phân biệt cặp âm dễ nhầm','pronunciation'],['grammar','Ngữ pháp: tự đặt câu','vocabulary'],['listen','Shadowing: ' + lt,'listening'],['ecom','Đọc 5 số liệu: ' + mt,'ecommerce']],
    [['vocab','Học 14 từ mới: ' + top,'vocabulary'],['pron','Trọng âm từ','pronunciation'],['grammar','Ngữ pháp: ôn lỗi sai','vocabulary'],['speak','Thực hành: ' + rt,'practice'],['ecom','Thuật ngữ TMĐT','ecommerce']],
    [['vocab','Học 14 từ mới: ' + top,'vocabulary'],['pron','Âm cuối -s / -ed','pronunciation'],['speak','Viết tin nhắn ngắn','practice'],['speak','Trả lời câu hỏi bằng tiếng Anh','listening'],['ecom','Đọc 5 số liệu: ' + mt,'ecommerce']]
  ];
  const times = [['07:00','07:15','cao'],['12:15','12:35','cao'],['20:00','20:15','vừa'],['20:15','20:30','vừa'],['20:30','20:40','thấp']];
  const out = [];
  days.forEach((d, i) => d.forEach(([skill, lesson, link], j) => out.push({ id: mkId(), date: addDaysFn(monday, i), start: times[j][0], end: times[j][1], skill, lesson, link, pri: times[j][2], status: 'planned', actual: null })));
  const sat = addDaysFn(monday, 5);
  out.push({ id: mkId(), date: sat, start:'09:00', end:'09:30', skill:'review', lesson:'Ôn tuần: từ và âm cần sửa', link:'progress', pri:'cao', status:'planned', actual:null });
  out.push({ id: mkId(), date: sat, start:'09:30', end:'10:00', skill:'review', lesson: weekIdx === 11 ? 'Bài kiểm tra mốc A1' : 'Bài kiểm tra tuần', link:'progress', pri:'cao', status:'planned', actual:null });
  out.push({ id: mkId(), date: sat, start:'10:00', end:'10:30', skill:'speak', lesson:'Ghi âm bài nói của tuần', link:'pronunciation', pri:'vừa', status:'planned', actual:null });
  return out;
}
