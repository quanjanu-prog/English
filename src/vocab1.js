/* Từ vựng 800 từ, 12 chủ đề (mỗi tuần một chủ đề). Mỗi dòng: từ|IPA|loại từ|nghĩa|ví dụ|cụm từ */
const VOCAB_TOPICS = {
  basic:'Giao tiếp cơ bản', people:'Con người và gia đình', daily:'Sinh hoạt hằng ngày', time:'Thời gian và lịch',
  food:'Ăn uống và mua sắm', places:'Nơi chốn và đi lại', describe:'Mô tả và cảm xúc', work:'Văn phòng và công việc',
  comm:'Họp, email và trao đổi', numbers:'Số liệu và báo cáo', ecom:'Sàn TMĐT và đơn hàng', marketing:'Marketing và khách hàng'
};
const VOCAB_RAW = {};
VOCAB_RAW.basic = `hello|həˈləʊ|interj.|xin chào|Hello, my name is Linh.|say hello
goodbye|ˌɡʊdˈbaɪ|interj.|tạm biệt|Goodbye, see you tomorrow.|say goodbye
please|pliːz|adv.|làm ơn, vui lòng|Please send me the file.|yes, please
thank|θæŋk|v.|cảm ơn|Thank you for your help.|thank you for
sorry|ˈsɒri|adj.|xin lỗi|Sorry, I am late.|I'm sorry
excuse|ɪkˈskjuːz|v.|xin lỗi (để hỏi, gây chú ý)|Excuse me, where is the lift?|excuse me
welcome|ˈwelkəm|adj./v.|chào mừng; không có gì|You are welcome.|you're welcome
name|neɪm|n.|tên|My name is Quan.|full name
introduce|ˌɪntrəˈdjuːs|v.|giới thiệu|Let me introduce myself.|introduce myself
nice|naɪs|adj.|vui, tốt|Nice to meet you.|nice to meet you
meet|miːt|v.|gặp|I meet a new client today.|meet a client
yes|jes|adv.|vâng, có|Yes, I can do it.|say yes
no|nəʊ|adv.|không|No, I don't have time today.|no problem
maybe|ˈmeɪbi|adv.|có lẽ|Maybe we can meet on Friday.|maybe later
okay|ˌəʊˈkeɪ|adj./adv.|được, ổn|Okay, I will check it.|that's okay
fine|faɪn|adj.|ổn, khỏe|I'm fine, thank you.|I'm fine
how|haʊ|adv.|như thế nào|How are you today?|how are you
what|wɒt|pron.|cái gì|What is your job?|what time
where|weə|adv.|ở đâu|Where do you live?|where is
when|wen|adv.|khi nào|When is the meeting?|when do you
who|huː|pron.|ai|Who is your manager?|who is
why|waɪ|adv.|tại sao|Why is the order late?|why not
which|wɪtʃ|pron.|cái nào|Which colour do you like?|which one
can|kæn|v.|có thể|Can you help me?|can I
could|kʊd|v.|có thể (lịch sự hơn)|Could you call me later?|could you
would|wʊd|v.|sẽ (dùng khi lịch sự)|Would you like some tea?|would you like
want|wɒnt|v.|muốn|I want to learn English.|want to
need|niːd|v.|cần|I need more time.|need to
like|laɪk|v.|thích|I like my job.|would like
know|nəʊ|v.|biết|I don't know the answer.|let me know
think|θɪŋk|v.|nghĩ|I think it is a good idea.|I think so
say|seɪ|v.|nói|What did she say?|say again
tell|tel|v.|kể, bảo|Please tell me the price.|tell me
ask|ɑːsk|v.|hỏi|Can I ask you something?|ask about
speak|spiːk|v.|nói (một ngôn ngữ)|Do you speak English?|speak English
talk|tɔːk|v.|nói chuyện|Let's talk after lunch.|talk to
listen|ˈlɪsn|v.|lắng nghe|Please listen carefully.|listen to
hear|hɪə|v.|nghe thấy|I can't hear you.|hear from
repeat|rɪˈpiːt|v.|nhắc lại|Could you repeat that, please?|repeat that
understand|ˌʌndəˈstænd|v.|hiểu|Sorry, I don't understand.|I don't understand
slowly|ˈsləʊli|adv.|chậm|Please speak slowly.|speak slowly
again|əˈɡen|adv.|lần nữa|Can you say it again?|once again
question|ˈkwestʃən|n.|câu hỏi|Can I ask a question?|ask a question
answer|ˈɑːnsə|n./v.|câu trả lời; trả lời|Thank you for your answer.|answer the phone
help|help|v./n.|giúp đỡ|Can you help me?|help me with
mean|miːn|v.|có nghĩa là|What does this word mean?|what does it mean
spell|spel|v.|đánh vần|How do you spell your name?|spell your name
word|wɜːd|n.|từ|I learn ten new words a day.|new word
sentence|ˈsentəns|n.|câu|Write one sentence about your job.|short sentence
language|ˈlæŋɡwɪdʒ|n.|ngôn ngữ|English is a useful language.|foreign language
English|ˈɪŋɡlɪʃ|n.|tiếng Anh|I study English every evening.|speak English
sure|ʃʊə|adj.|chắc chắn|Sure, no problem.|sure, no problem
problem|ˈprɒbləm|n.|vấn đề|There is a problem with my order.|no problem
available|əˈveɪləbl|adj.|rảnh; có sẵn|Are you available tomorrow?|available now
confirm|kənˈfɜːm|v.|xác nhận|Can you confirm the time?|confirm the order
right|raɪt|adj.|đúng|Is this the right address?|that's right
wrong|rɒŋ|adj.|sai|Sorry, this is the wrong item.|something wrong
idea|aɪˈdɪə|n.|ý tưởng|That is a great idea.|good idea
agree|əˈɡriː|v.|đồng ý|I agree with you.|agree with
really|ˈrɪəli|adv.|thật sự|I really like this product.|really good
very|ˈveri|adv.|rất|The traffic is very bad today.|very much
also|ˈɔːlsəʊ|adv.|cũng|We also sell on TikTok Shop.|and also
but|bʌt|conj.|nhưng|The bag is nice, but it is expensive.|but also
because|bɪˈkɒz|conj.|bởi vì|I am late because of the rain.|because of
so|səʊ|conj.|vì vậy|It was raining, so I took a taxi.|so that
and|ænd|conj.|và|I sell shampoo and conditioner.|and then
or|ɔː|conj.|hoặc|Tea or coffee?|or not
here|hɪə|adv.|ở đây|Here is the report.|over here
there|ðeə|adv.|ở đó|There are five people in my team.|there is
this|ðɪs|det.|này|This product is new.|this week
that|ðæt|det.|kia, đó|That idea is good.|that's right
something|ˈsʌmθɪŋ|pron.|cái gì đó|I need to tell you something.|something new
everyone|ˈevriwʌn|pron.|mọi người|Good morning, everyone.|everyone here
message|ˈmesɪdʒ|n.|tin nhắn|I will send you a message.|send a message
call|kɔːl|v./n.|gọi điện; cuộc gọi|I will call you back.|call back
phone|fəʊn|n.|điện thoại|My phone number is on the card.|phone number
wait|weɪt|v.|chờ|Please wait a moment.|wait for
moment|ˈməʊmənt|n.|lát, khoảnh khắc|Just a moment, please.|at the moment
example|ɪɡˈzɑːmpl|n.|ví dụ|Can you give me an example?|for example
mistake|mɪˈsteɪk|n.|lỗi, sai sót|Sorry, it was my mistake.|make a mistake`;
VOCAB_RAW.people = `family|ˈfæməli|n.|gia đình|I live with my family.|my family
parent|ˈpeərənt|n.|cha hoặc mẹ|My parents live in Can Tho.|my parents
mother|ˈmʌðə|n.|mẹ|My mother cooks very well.|my mother
father|ˈfɑːðə|n.|bố|My father is a teacher.|my father
brother|ˈbrʌðə|n.|anh, em trai|My brother works in Hanoi.|older brother
sister|ˈsɪstə|n.|chị, em gái|My sister is a student.|younger sister
husband|ˈhʌzbənd|n.|chồng|Her husband is an engineer.|her husband
wife|waɪf|n.|vợ|His wife sells clothes online.|his wife
son|sʌn|n.|con trai|Their son is five years old.|their son
daughter|ˈdɔːtə|n.|con gái|My daughter likes drawing.|my daughter
child|tʃaɪld|n.|đứa trẻ (số nhiều: children)|They have one child.|only child
baby|ˈbeɪbi|n.|em bé|The baby is sleeping.|new baby
grandparent|ˈɡrænpeərənt|n.|ông hoặc bà|I visit my grandparents on Sunday.|my grandparents
friend|frend|n.|bạn|She is my best friend.|best friend
neighbour|ˈneɪbə|n.|hàng xóm|My neighbour has a cat.|next-door neighbour
people|ˈpiːpl|n.|người (số nhiều)|Many people shop online.|young people
person|ˈpɜːsn|n.|người|She is a friendly person.|in person
man|mæn|n.|đàn ông|The man at the door is a shipper.|young man
woman|ˈwʊmən|n.|phụ nữ|The woman bought three bottles.|young woman
boy|bɔɪ|n.|cậu bé|The boy is my nephew.|little boy
girl|ɡɜːl|n.|cô bé|The girl is wearing a red dress.|little girl
age|eɪdʒ|n.|tuổi|We are the same age.|same age
old|əʊld|adj.|già; (bao nhiêu) tuổi|I am twenty-eight years old.|years old
young|jʌŋ|adj.|trẻ|Our customers are young women.|young people
born|bɔːn|adj.|được sinh ra|I was born in Da Nang.|born in
live|lɪv|v.|sống|I live in District 7.|live with
home|həʊm|n.|nhà|I work from home on Fridays.|at home
house|haʊs|n.|ngôi nhà|Their house is near the river.|big house
job|dʒɒb|n.|công việc|I love my job.|new job
work|wɜːk|v./n.|làm việc; công việc|I work from Monday to Friday.|go to work
student|ˈstjuːdnt|n.|học sinh, sinh viên|My sister is a university student.|university student
teacher|ˈtiːtʃə|n.|giáo viên|My English teacher is from Australia.|English teacher
doctor|ˈdɒktə|n.|bác sĩ|I need to see a doctor.|see a doctor
driver|ˈdraɪvə|n.|tài xế|The driver is waiting outside.|delivery driver
engineer|ˌendʒɪˈnɪə|n.|kỹ sư|He is a software engineer.|software engineer
owner|ˈəʊnə|n.|chủ sở hữu|She is the shop owner.|shop owner
boss|bɒs|n.|sếp|My boss is in a meeting.|my boss
staff|stɑːf|n.|nhân viên (tập thể)|Our staff work hard.|staff member
partner|ˈpɑːtnə|n.|đối tác; cộng sự|We have a new business partner.|business partner
guest|ɡest|n.|khách|We have two guests today.|special guest
married|ˈmærid|adj.|đã kết hôn|Are you married?|get married
single|ˈsɪŋɡl|adj.|độc thân; đơn|I am single.|single room
friendly|ˈfrendli|adj.|thân thiện|The staff are very friendly.|friendly service
kind|kaɪnd|adj.|tốt bụng|Thank you, you are very kind.|kind to
funny|ˈfʌni|adj.|vui tính, buồn cười|My colleague is very funny.|funny story
smart|smɑːt|adj.|thông minh|She is a smart manager.|smart idea
hard-working|ˌhɑːdˈwɜːkɪŋ|adj.|chăm chỉ|Our team is hard-working.|hard-working staff
quiet|ˈkwaɪət|adj.|trầm lặng; yên tĩnh|He is quiet in meetings.|quiet place
tall|tɔːl|adj.|cao|My brother is very tall.|tall building
short|ʃɔːt|adj.|thấp; ngắn|She has short hair.|short time
hair|heə|n.|tóc|This shampoo is for dry hair.|dry hair
face|feɪs|n.|khuôn mặt|Wash your face before bed.|face wash
eye|aɪ|n.|mắt|She has brown eyes.|eye cream
hand|hænd|n.|tay|Wash your hands, please.|by hand
birthday|ˈbɜːθdeɪ|n.|sinh nhật|Today is my mother's birthday.|happy birthday
party|ˈpɑːti|n.|bữa tiệc|We have a team party on Friday.|birthday party
love|lʌv|v.|yêu, rất thích|I love spending time with my family.|love to
visit|ˈvɪzɪt|v.|thăm|I visit my parents every month.|visit family
together|təˈɡeðə|adv.|cùng nhau|We have lunch together.|work together
alone|əˈləʊn|adv.|một mình|I live alone.|live alone`;
VOCAB_RAW.daily = `get up|ˌɡet ˈʌp|v.|thức dậy|I get up at six thirty.|get up early
wake up|ˌweɪk ˈʌp|v.|tỉnh giấc|I wake up before my alarm.|wake up early
sleep|sliːp|v.|ngủ|I sleep seven hours a night.|go to sleep
bed|bed|n.|giường|I go to bed at eleven.|go to bed
shower|ˈʃaʊə|n.|vòi sen; việc tắm|I take a shower in the morning.|take a shower
wash|wɒʃ|v.|rửa, giặt|I wash my hair every two days.|wash clothes
brush|brʌʃ|v.|chải, đánh (răng)|I brush my teeth twice a day.|brush your teeth
clothes|kləʊðz|n.|quần áo|I buy clothes online.|wear clothes
wear|weə|v.|mặc, đeo|I wear a uniform at work.|wear glasses
dress|dres|n./v.|váy; mặc đồ|She is wearing a blue dress.|get dressed
shoes|ʃuːz|n.|giày|These shoes are comfortable.|a pair of shoes
cook|kʊk|v.|nấu ăn|I cook dinner on Sunday.|cook dinner
clean|kliːn|v./adj.|dọn dẹp; sạch|I clean my room on Saturday.|clean the house
room|ruːm|n.|phòng|My room is small but bright.|meeting room
kitchen|ˈkɪtʃɪn|n.|nhà bếp|The kitchen is next to the living room.|in the kitchen
bathroom|ˈbɑːθruːm|n.|phòng tắm|Where is the bathroom?|use the bathroom
door|dɔː|n.|cửa|Please close the door.|open the door
window|ˈwɪndəʊ|n.|cửa sổ|Can you open the window?|by the window
table|ˈteɪbl|n.|bàn|The keys are on the table.|book a table
chair|tʃeə|n.|ghế|Please take a chair.|office chair
key|kiː|n.|chìa khóa|I can't find my keys.|car key
bag|bæɡ|n.|túi|My laptop is in my bag.|shopping bag
money|ˈmʌni|n.|tiền|I want to save more money.|save money
pay|peɪ|v.|trả tiền|Can I pay by card?|pay for
buy|baɪ|v.|mua|I buy groceries on Sunday.|buy online
use|juːz|v.|sử dụng|I use my phone to check orders.|use a voucher
open|ˈəʊpən|v./adj.|mở; đang mở|The shop opens at nine.|open the app
close|kləʊz|v.|đóng|The shop closes at ten p.m.|close the door
start|stɑːt|v.|bắt đầu|I start work at eight thirty.|start a business
finish|ˈfɪnɪʃ|v.|kết thúc, hoàn thành|I finish work at six.|finish the task
begin|bɪˈɡɪn|v.|bắt đầu|The class begins at seven.|begin with
stop|stɒp|v.|dừng|Please stop the ads tonight.|stop working
go|ɡəʊ|v.|đi|I go to work by motorbike.|go home
come|kʌm|v.|đến|Can you come to my office?|come back
leave|liːv|v.|rời đi|I leave home at seven forty-five.|leave work
arrive|əˈraɪv|v.|đến nơi|The package will arrive tomorrow.|arrive at
walk|wɔːk|v.|đi bộ|I walk to the coffee shop.|go for a walk
run|rʌn|v.|chạy; vận hành|I run in the park on Sunday.|run a shop
drive|draɪv|v.|lái xe|I drive to work.|drive a car
ride|raɪd|v.|đi (xe máy, xe đạp)|I ride a motorbike to work.|ride a bike
eat|iːt|v.|ăn|I eat lunch at noon.|eat out
drink|drɪŋk|v.|uống|I drink a lot of water.|drink coffee
read|riːd|v.|đọc|I read the news in the morning.|read a report
write|raɪt|v.|viết|I write a short diary in English.|write an email
watch|wɒtʃ|v.|xem|I watch movies at the weekend.|watch TV
play|pleɪ|v.|chơi|My son plays football.|play games
study|ˈstʌdi|v.|học|I study English every evening.|study hard
learn|lɜːn|v.|học (để biết)|I want to learn new skills.|learn English
practise|ˈpræktɪs|v.|luyện tập|I practise speaking every day.|practise English
relax|rɪˈlæks|v.|thư giãn|I relax with music after work.|relax at home
rest|rest|n./v.|nghỉ ngơi|Take a rest after lunch.|take a rest
music|ˈmjuːzɪk|n.|âm nhạc|I listen to music on the way to work.|listen to music
movie|ˈmuːvi|n.|phim|Let's watch a movie tonight.|watch a movie
game|ɡeɪm|n.|trò chơi|He plays games on his phone.|play a game
sport|spɔːt|n.|thể thao|My favourite sport is badminton.|play sport
gym|dʒɪm|n.|phòng tập|I go to the gym three times a week.|go to the gym
exercise|ˈeksəsaɪz|n./v.|tập thể dục|I do exercise every morning.|do exercise
hobby|ˈhɒbi|n.|sở thích|My hobby is cooking.|my hobby is
photo|ˈfəʊtəʊ|n.|ảnh|I take product photos every week.|take a photo
book|bʊk|n./v.|sách; đặt chỗ|I read a book before bed.|read a book
news|njuːz|n.|tin tức|I read the news on my phone.|good news
internet|ˈɪntənet|n.|mạng internet|The internet is slow today.|on the internet
app|æp|n.|ứng dụng|I use this app to learn English.|download an app
laptop|ˈlæptɒp|n.|máy tính xách tay|My laptop is very old.|work laptop
charge|tʃɑːdʒ|v.|sạc pin; tính phí|I need to charge my phone.|charge the phone
weather|ˈweðə|n.|thời tiết|The weather is hot today.|good weather
rain|reɪn|n./v.|mưa|It often rains in the afternoon.|heavy rain
hot|hɒt|adj.|nóng|It is very hot in April.|hot weather
cold|kəʊld|adj.|lạnh|This room is too cold.|cold drink
sun|sʌn|n.|mặt trời|The sun is very strong at noon.|in the sun
umbrella|ʌmˈbrelə|n.|ô, dù|Take an umbrella with you.|bring an umbrella
always|ˈɔːlweɪz|adv.|luôn luôn|I always check orders first.|almost always
often|ˈɒfn|adv.|thường|I often work late on sale days.|how often
sometimes|ˈsʌmtaɪmz|adv.|thỉnh thoảng|I sometimes eat at my desk.|only sometimes
never|ˈnevə|adv.|không bao giờ|I never skip breakfast.|never again
every|ˈevri|det.|mỗi|I check the dashboard every day.|every day
busy|ˈbɪzi|adj.|bận|I am very busy this week.|busy day
free|friː|adj.|rảnh; miễn phí|Are you free tonight?|free time
habit|ˈhæbɪt|n.|thói quen|Reading is a good habit.|good habit
routine|ruːˈtiːn|n.|nếp sinh hoạt hằng ngày|My morning routine is simple.|daily routine`;
VOCAB_RAW.time = `time|taɪm|n.|thời gian; giờ|What time is it?|on time
hour|ˈaʊə|n.|giờ, tiếng|I study for one hour.|half an hour
minute|ˈmɪnɪt|n.|phút|The meeting takes thirty minutes.|five minutes
second|ˈsekənd|n./adj.|giây; thứ hai|Wait a second.|second floor
day|deɪ|n.|ngày|Have a nice day!|every day
week|wiːk|n.|tuần|We plan the ads every week.|next week
month|mʌnθ|n.|tháng|Sales are good this month.|last month
year|jɪə|n.|năm|I started this job last year.|this year
today|təˈdeɪ|adv.|hôm nay|Today is Monday.|today's orders
tomorrow|təˈmɒrəʊ|adv.|ngày mai|See you tomorrow.|tomorrow morning
yesterday|ˈjestədeɪ|adv.|hôm qua|I sent it yesterday.|yesterday afternoon
now|naʊ|adv.|bây giờ|I am busy now.|right now
later|ˈleɪtə|adv.|sau, lát nữa|I will call you later.|see you later
soon|suːn|adv.|sớm, chẳng bao lâu|The new product is coming soon.|very soon
early|ˈɜːli|adj./adv.|sớm|I get up early.|early morning
late|leɪt|adj./adv.|muộn, trễ|Sorry I'm late.|late delivery
morning|ˈmɔːnɪŋ|n.|buổi sáng|I check orders in the morning.|this morning
afternoon|ˌɑːftəˈnuːn|n.|buổi chiều|We have a meeting this afternoon.|in the afternoon
evening|ˈiːvnɪŋ|n.|buổi tối|I study English in the evening.|this evening
night|naɪt|n.|đêm|Many people shop late at night.|last night
noon|nuːn|n.|buổi trưa|Lunch is at noon.|at noon
weekend|ˌwiːkˈend|n.|cuối tuần|I go to the market at the weekend.|at the weekend
Monday|ˈmʌndeɪ|n.|thứ Hai|The report is due on Monday.|on Monday
Tuesday|ˈtjuːzdeɪ|n.|thứ Ba|We have a livestream on Tuesday.|next Tuesday
Wednesday|ˈwenzdeɪ|n.|thứ Tư|Wednesday is a busy day.|on Wednesday
Thursday|ˈθɜːzdeɪ|n.|thứ Năm|I am off on Thursday afternoon.|this Thursday
Friday|ˈfraɪdeɪ|n.|thứ Sáu|The deadline is Friday.|on Friday
Saturday|ˈsætədeɪ|n.|thứ Bảy|I study for ninety minutes on Saturday.|on Saturday
Sunday|ˈsʌndeɪ|n.|Chủ nhật|I rest on Sunday.|every Sunday
January|ˈdʒænjuəri|n.|tháng Một|Tet is usually in January or February.|in January
March|mɑːtʃ|n.|tháng Ba|Our new brand launches in March.|in March
June|dʒuːn|n.|tháng Sáu|The mid-year sale is in June.|in June
October|ɒkˈtəʊbə|n.|tháng Mười|My course starts in October.|in October
November|nəʊˈvembə|n.|tháng Mười Một|November has big sale days.|in November
December|dɪˈsembə|n.|tháng Mười Hai|December is a busy month.|in December
date|deɪt|n.|ngày (tháng)|What is the date today?|delivery date
calendar|ˈkælɪndə|n.|lịch|Please add it to your calendar.|check the calendar
o'clock|əˈklɒk|adv.|giờ đúng|The shop opens at nine o'clock.|at nine o'clock
quarter|ˈkwɔːtə|n.|một phần tư; quý|It's a quarter past eight.|first quarter
past|pɑːst|prep.|quá, hơn (giờ)|It's ten past five.|half past
before|bɪˈfɔː|prep.|trước|Check the stock before the sale.|before lunch
after|ˈɑːftə|prep.|sau|I go to the gym after work.|after that
during|ˈdjʊərɪŋ|prep.|trong suốt|Orders doubled during the sale.|during the day
until|ənˈtɪl|prep.|cho đến khi|I work until six p.m.|until then
ago|əˈɡəʊ|adv.|trước đây|I started two months ago.|a week ago
next|nekst|adj.|tiếp theo|See you next week.|next month
last|lɑːst|adj.|trước; cuối cùng|Sales were good last week.|last year
usually|ˈjuːʒuəli|adv.|thường thường|I usually work until six.|usually do
already|ɔːlˈredi|adv.|đã … rồi|I have already sent it.|already done
still|stɪl|adv.|vẫn|The order is still on the way.|still waiting
just|dʒʌst|adv.|vừa mới; chỉ|I just finished the report.|just now
holiday|ˈhɒlədeɪ|n.|kỳ nghỉ, ngày lễ|We have a long holiday in April.|public holiday
appointment|əˈpɔɪntmənt|n.|cuộc hẹn|I have an appointment at three.|make an appointment
timetable|ˈtaɪmteɪbl|n.|thời gian biểu|Here is my study timetable.|class timetable
daily|ˈdeɪli|adj.|hằng ngày|We send a daily report.|daily budget
weekly|ˈwiːkli|adj.|hằng tuần|We have a weekly meeting.|weekly report
monthly|ˈmʌnθli|adj.|hằng tháng|This is our monthly target.|monthly sales
season|ˈsiːzn|n.|mùa|The rainy season starts in May.|sale season
midnight|ˈmɪdnaɪt|n.|nửa đêm|The flash sale starts at midnight.|at midnight
Tet|tet|n.|Tết Nguyên đán|I go back to my hometown at Tet.|Tet holiday`;
