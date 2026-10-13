"""Static learning content: question bank and lesson units for English Clash & Learn.

Question types:
  - word_match : quick EN<->TR word matching (5s). options + answer.
  - fill_blank : sentence completion / fill in the blank. options + answer.
  - word_order : word assembly. words (scrambled) + correct_order (list).
"""
import random

LEVELS = ["A1", "A2", "B1", "B2", "C1"]

# ---------------------------------------------------------------------------
# QUESTION BANK
# ---------------------------------------------------------------------------
QUESTIONS = [
    # ---------------------------- A1 ----------------------------
    {"id": "a1_wm_1", "level": "A1", "type": "word_match", "prompt": "“Apple” kelimesinin Türkçesi nedir?", "options": ["Elma", "Armut", "Muz", "Üzüm"], "answer": "Elma", "tr_hint": "Kırmızı veya yeşil, en bilinen meyvelerden biri."},
    {"id": "a1_wm_2", "level": "A1", "type": "word_match", "prompt": "“House” ne demek?", "options": ["Araba", "Ev", "Okul", "Köpek"], "answer": "Ev", "tr_hint": "İçinde yaşadığımız yer."},
    {"id": "a1_wm_3", "level": "A1", "type": "word_match", "prompt": "“Water” kelimesinin anlamı?", "options": ["Süt", "Ekmek", "Su", "Çay"], "answer": "Su", "tr_hint": "İçmeden yaşayamayız, renksizdir."},
    {"id": "a1_wm_4", "level": "A1", "type": "word_match", "prompt": "“Cat” ne demek?", "options": ["Köpek", "Kuş", "Kedi", "Balık"], "answer": "Kedi", "tr_hint": "Miyav der."},
    {"id": "a1_wm_5", "level": "A1", "type": "word_match", "prompt": "“Red” kelimesinin Türkçesi?", "options": ["Mavi", "Kırmızı", "Yeşil", "Sarı"], "answer": "Kırmızı", "tr_hint": "Ateşin ve kanın rengi."},
    {"id": "a1_fb_1", "level": "A1", "type": "fill_blank", "prompt": "I ___ a student.", "options": ["am", "is", "are", "be"], "answer": "am", "tr_hint": "'I' öznesi ile hangi 'to be' fiili kullanılır?"},
    {"id": "a1_fb_2", "level": "A1", "type": "fill_blank", "prompt": "She ___ my sister.", "options": ["am", "are", "is", "do"], "answer": "is", "tr_hint": "Tekil 3. şahıs (she) için 'to be'."},
    {"id": "a1_fb_3", "level": "A1", "type": "fill_blank", "prompt": "There are two ___ on the table.", "options": ["book", "books", "a book", "booking"], "answer": "books", "tr_hint": "'two' çoğul demektir."},
    {"id": "a1_fb_4", "level": "A1", "type": "fill_blank", "prompt": "I like ___ apple every morning.", "options": ["a", "an", "the", "-"], "answer": "an", "tr_hint": "Sesli harfle başlayan kelimeden önce hangi artikel?"},
    {"id": "a1_wo_1", "level": "A1", "type": "word_order", "words": ["name", "is", "My", "John"], "correct_order": ["My", "name", "is", "John"], "tr_hint": "Önce özne, sonra fiil: 'Benim adım John.'"},
    {"id": "a1_wo_2", "level": "A1", "type": "word_order", "words": ["like", "I", "coffee"], "correct_order": ["I", "like", "coffee"], "tr_hint": "Özne + fiil + nesne."},
    {"id": "a1_wo_3", "level": "A1", "type": "word_order", "words": ["she", "happy", "is"], "correct_order": ["she", "is", "happy"], "tr_hint": "Özne + is + sıfat."},

    # ---------------------------- A2 ----------------------------
    {"id": "a2_wm_1", "level": "A2", "type": "word_match", "prompt": "“Weather” ne demek?", "options": ["Zaman", "Hava durumu", "Mevsim", "Rüzgar"], "answer": "Hava durumu", "tr_hint": "Yağmurlu, güneşli... bugün nasıl?"},
    {"id": "a2_wm_2", "level": "A2", "type": "word_match", "prompt": "“Expensive” kelimesinin anlamı?", "options": ["Ucuz", "Pahalı", "Bedava", "Yeni"], "answer": "Pahalı", "tr_hint": "Çok para gerektiren."},
    {"id": "a2_wm_3", "level": "A2", "type": "word_match", "prompt": "“To travel” ne demek?", "options": ["Çalışmak", "Uyumak", "Seyahat etmek", "Beklemek"], "answer": "Seyahat etmek", "tr_hint": "Farklı şehir/ülkelere gitmek."},
    {"id": "a2_wm_4", "level": "A2", "type": "word_match", "prompt": "“Hungry” kelimesinin anlamı?", "options": ["Yorgun", "Susuz", "Aç", "Mutlu"], "answer": "Aç", "tr_hint": "Yemek yeme ihtiyacı."},
    {"id": "a2_wm_5", "level": "A2", "type": "word_match", "prompt": "“Always” ne demek?", "options": ["Asla", "Bazen", "Her zaman", "Nadiren"], "answer": "Her zaman", "tr_hint": "Sıklık zarfı: %100."},
    {"id": "a2_fb_1", "level": "A2", "type": "fill_blank", "prompt": "Yesterday I ___ to the cinema.", "options": ["go", "goes", "went", "going"], "answer": "went", "tr_hint": "'Yesterday' geçmiş zaman ister."},
    {"id": "a2_fb_2", "level": "A2", "type": "fill_blank", "prompt": "She is ___ than her brother.", "options": ["tall", "taller", "tallest", "more tall"], "answer": "taller", "tr_hint": "Karşılaştırma: iki kişi arasında."},
    {"id": "a2_fb_3", "level": "A2", "type": "fill_blank", "prompt": "We ___ watching TV now.", "options": ["is", "am", "are", "be"], "answer": "are", "tr_hint": "'We' + present continuous."},
    {"id": "a2_fb_4", "level": "A2", "type": "fill_blank", "prompt": "There isn't ___ milk in the fridge.", "options": ["some", "any", "a", "many"], "answer": "any", "tr_hint": "Olumsuz cümlede sayılamayan isim."},
    {"id": "a2_wo_1", "level": "A2", "type": "word_order", "words": ["to", "going", "I", "am", "school"], "correct_order": ["I", "am", "going", "to", "school"], "tr_hint": "Present continuous: am + going."},
    {"id": "a2_wo_2", "level": "A2", "type": "word_order", "words": ["did", "What", "do", "you", "yesterday"], "correct_order": ["What", "did", "you", "do", "yesterday"], "tr_hint": "Soru kelimesi + did + özne + fiil."},
    {"id": "a2_wo_3", "level": "A2", "type": "word_order", "words": ["coffee", "than", "prefer", "tea", "I"], "correct_order": ["I", "prefer", "tea", "than", "coffee"], "tr_hint": "Özne + prefer + nesne."},

    # ---------------------------- B1 ----------------------------
    {"id": "b1_wm_1", "level": "B1", "type": "word_match", "prompt": "“Although” bağlacının anlamı?", "options": ["Çünkü", "-e rağmen", "Ve", "Ya da"], "answer": "-e rağmen", "tr_hint": "Zıtlık bildiren bir bağlaç."},
    {"id": "b1_wm_2", "level": "B1", "type": "word_match", "prompt": "“Advice” ne demek?", "options": ["Haber", "Tavsiye", "İzin", "Karar"], "answer": "Tavsiye", "tr_hint": "Birine ne yapması gerektiğini önermek."},
    {"id": "b1_wm_3", "level": "B1", "type": "word_match", "prompt": "“To improve” kelimesinin anlamı?", "options": ["Bozmak", "Geliştirmek", "Durdurmak", "Unutmak"], "answer": "Geliştirmek", "tr_hint": "Daha iyi hale getirmek."},
    {"id": "b1_wm_4", "level": "B1", "type": "word_match", "prompt": "“Meeting” iş hayatında ne demek?", "options": ["Toplantı", "Molası", "Rapor", "Zam"], "answer": "Toplantı", "tr_hint": "İnsanların bir araya gelip konuştuğu etkinlik."},
    {"id": "b1_wm_5", "level": "B1", "type": "word_match", "prompt": "“Decision” ne demek?", "options": ["Fikir", "Karar", "Soru", "Hata"], "answer": "Karar", "tr_hint": "'To decide' fiilinin ismi."},
    {"id": "b1_fb_1", "level": "B1", "type": "fill_blank", "prompt": "If it rains, we ___ stay home.", "options": ["will", "would", "are", "have"], "answer": "will", "tr_hint": "First conditional: if + present, ... will."},
    {"id": "b1_fb_2", "level": "B1", "type": "fill_blank", "prompt": "I have ___ in London for five years.", "options": ["live", "lived", "living", "lives"], "answer": "lived", "tr_hint": "Present perfect: have + V3."},
    {"id": "b1_fb_3", "level": "B1", "type": "fill_blank", "prompt": "The report ___ finished by John.", "options": ["was", "did", "has", "is being"], "answer": "was", "tr_hint": "Edilgen (passive) geçmiş: was + V3."},
    {"id": "b1_fb_4", "level": "B1", "type": "fill_blank", "prompt": "You ___ smoke here; it's not allowed.", "options": ["should", "mustn't", "can", "would"], "answer": "mustn't", "tr_hint": "Yasak bildiren modal."},
    {"id": "b1_wo_1", "level": "B1", "type": "word_order", "words": ["been", "have", "to", "Paris", "I", "never"], "correct_order": ["I", "have", "never", "been", "to", "Paris"], "tr_hint": "Present perfect + never."},
    {"id": "b1_wo_2", "level": "B1", "type": "word_order", "words": ["would", "I", "a", "like", "meeting", "schedule", "to"], "correct_order": ["I", "would", "like", "to", "schedule", "a", "meeting"], "tr_hint": "would like to + fiil."},
    {"id": "b1_wo_3", "level": "B1", "type": "word_order", "words": ["the", "was", "by", "written", "letter", "her"], "correct_order": ["the", "letter", "was", "written", "by", "her"], "tr_hint": "Passive voice yapısı."},

    # ---------------------------- B2 ----------------------------
    {"id": "b2_wm_1", "level": "B2", "type": "word_match", "prompt": "“Reluctant” ne demek?", "options": ["İstekli", "İsteksiz / gönülsüz", "Hızlı", "Cesur"], "answer": "İsteksiz / gönülsüz", "tr_hint": "Bir şeyi yapmaya pek niyetli olmamak."},
    {"id": "b2_wm_2", "level": "B2", "type": "word_match", "prompt": "“To acknowledge” kelimesinin anlamı?", "options": ["Reddetmek", "Kabul etmek / onaylamak", "Saklamak", "Beklemek"], "answer": "Kabul etmek / onaylamak", "tr_hint": "Bir gerçeği veya mesajı aldığını belirtmek."},
    {"id": "b2_wm_3", "level": "B2", "type": "word_match", "prompt": "“Significant” ne demek?", "options": ["Önemsiz", "Belirsiz", "Önemli / kayda değer", "Geçici"], "answer": "Önemli / kayda değer", "tr_hint": "Dikkate alınması gereken büyüklükte."},
    {"id": "b2_wm_4", "level": "B2", "type": "word_match", "prompt": "“To postpone” kelimesinin anlamı?", "options": ["İptal etmek", "Ertelemek", "Hızlandırmak", "Başlatmak"], "answer": "Ertelemek", "tr_hint": "Daha sonraki bir tarihe bırakmak."},
    {"id": "b2_wm_5", "level": "B2", "type": "word_match", "prompt": "“Thorough” ne demek?", "options": ["Yüzeysel", "Ayrıntılı / titiz", "Hızlı", "Yanlış"], "answer": "Ayrıntılı / titiz", "tr_hint": "Her detayı kapsayan, eksiksiz."},
    {"id": "b2_fb_1", "level": "B2", "type": "fill_blank", "prompt": "If I ___ known, I would have called you.", "options": ["have", "had", "would", "did"], "answer": "had", "tr_hint": "Third conditional: if + had + V3."},
    {"id": "b2_fb_2", "level": "B2", "type": "fill_blank", "prompt": "He suggested ___ a break.", "options": ["to take", "taking", "take", "took"], "answer": "taking", "tr_hint": "'suggest' fiilinden sonra -ing."},
    {"id": "b2_fb_3", "level": "B2", "type": "fill_blank", "prompt": "The project needs to be ___ by Friday.", "options": ["complete", "completed", "completing", "completion"], "answer": "completed", "tr_hint": "'to be' + V3 (passive)."},
    {"id": "b2_fb_4", "level": "B2", "type": "fill_blank", "prompt": "Not only ___ late, but he also forgot the files.", "options": ["he was", "was he", "he is", "is he"], "answer": "was he", "tr_hint": "'Not only' ile başlayınca devrik yapı."},
    {"id": "b2_wo_1", "level": "B2", "type": "word_order", "words": ["have", "the", "should", "deadline", "we", "extended"], "correct_order": ["we", "should", "have", "extended", "the", "deadline"], "tr_hint": "should have + V3 (geçmişe pişmanlık)."},
    {"id": "b2_wo_2", "level": "B2", "type": "word_order", "words": ["being", "despite", "tired", "worked", "she", "hard"], "correct_order": ["despite", "being", "tired", "she", "worked", "hard"], "tr_hint": "despite + -ing."},
    {"id": "b2_wo_3", "level": "B2", "type": "word_order", "words": ["had", "the", "sooner", "I", "finished", "the", "better"], "correct_order": ["the", "sooner", "I", "had", "finished", "the", "better"], "tr_hint": "the + comparative ... the + comparative."},

    # ---------------------------- C1 ----------------------------
    {"id": "c1_wm_1", "level": "C1", "type": "word_match", "prompt": "“To bite the bullet” deyimi ne anlama gelir?", "options": ["Pes etmek", "Zor bir durumu cesaretle göğüslemek", "Acele etmek", "Yalan söylemek"], "answer": "Zor bir durumu cesaretle göğüslemek", "tr_hint": "Kaçınılmaz, zor bir şeyi dişini sıkarak yapmak."},
    {"id": "c1_wm_2", "level": "C1", "type": "word_match", "prompt": "“Ubiquitous” kelimesinin anlamı?", "options": ["Nadir", "Her yerde bulunan / yaygın", "Geçici", "Gizli"], "answer": "Her yerde bulunan / yaygın", "tr_hint": "Aynı anda her yerde var gibi görünen."},
    {"id": "c1_wm_3", "level": "C1", "type": "word_match", "prompt": "“To cut corners” deyimi?", "options": ["Dikkatli olmak", "Kalite/kuraldan ödün vererek işi hızlı yapmak", "Köşeye sıkışmak", "Yol kısaltmak"], "answer": "Kalite/kuraldan ödün vererek işi hızlı yapmak", "tr_hint": "Zaman/para için gereken adımları atlamak."},
    {"id": "c1_wm_4", "level": "C1", "type": "word_match", "prompt": "“Meticulous” ne demek?", "options": ["Özensiz", "Son derece titiz / ayrıntıcı", "Tembel", "Aceleci"], "answer": "Son derece titiz / ayrıntıcı", "tr_hint": "En küçük detaya bile aşırı özen gösteren."},
    {"id": "c1_wm_5", "level": "C1", "type": "word_match", "prompt": "“To get cold feet” deyimi?", "options": ["Üşümek", "Son anda cesaretini/kararlılığını yitirmek", "Hastalanmak", "Geç kalmak"], "answer": "Son anda cesaretini/kararlılığını yitirmek", "tr_hint": "Önemli bir andan hemen önce korkuya kapılmak."},
    {"id": "c1_fb_1", "level": "C1", "type": "fill_blank", "prompt": "Rarely ___ such a compelling argument.", "options": ["I have heard", "have I heard", "I heard", "did I heard"], "answer": "have I heard", "tr_hint": "Olumsuz/kısıtlayıcı zarf başta: devrik yapı (inversion)."},
    {"id": "c1_fb_2", "level": "C1", "type": "fill_blank", "prompt": "The proposal, ___ merits, was ultimately rejected.", "options": ["despite its", "although", "even", "whereas"], "answer": "despite its", "tr_hint": "İsimden önce zıtlık edatı."},
    {"id": "c1_fb_3", "level": "C1", "type": "fill_blank", "prompt": "Were I ___ in your position, I would reconsider.", "options": ["to be", "been", "being", "be"], "answer": "to be", "tr_hint": "Resmi koşul yapısı: Were I to..."},
    {"id": "c1_fb_4", "level": "C1", "type": "fill_blank", "prompt": "His remarks were nothing ___ of brilliant.", "options": ["less", "short", "far", "but"], "answer": "short", "tr_hint": "'nothing short of' = tam anlamıyla kalıbı."},
    {"id": "c1_wo_1", "level": "C1", "type": "word_order", "words": ["had", "I", "known", "would", "I", "differently", "acted", "have"], "correct_order": ["had", "I", "known", "I", "would", "have", "acted", "differently"], "tr_hint": "Devrik third conditional: 'Had I known...'."},
    {"id": "c1_wo_2", "level": "C1", "type": "word_order", "words": ["under", "no", "will", "circumstances", "we", "compromise"], "correct_order": ["under", "no", "circumstances", "will", "we", "compromise"], "tr_hint": "Olumsuz başlangıç + inversion."},
    {"id": "c1_wo_3", "level": "C1", "type": "word_order", "words": ["so", "was", "the", "that", "compelling", "argument", "everyone", "agreed"], "correct_order": ["so", "compelling", "was", "the", "argument", "that", "everyone", "agreed"], "tr_hint": "So + sıfat + inversion + that."},
]

# ---------------------------------------------------------------------------
# LESSON UNITS
# ---------------------------------------------------------------------------
UNITS = [
    {"id": "A1-U1", "level": "A1", "order": 1, "title": "Greetings & Basics", "desc": "Selamlaşma ve temel kelimeler",
     "teach": [{"en": "Hello / Hi", "tr": "Merhaba"}, {"en": "Good morning", "tr": "Günaydın"}, {"en": "My name is...", "tr": "Benim adım..."}, {"en": "Nice to meet you", "tr": "Tanıştığımıza memnun oldum"}]},
    {"id": "A1-U2", "level": "A1", "order": 2, "title": "Everyday Words", "desc": "Günlük hayattan kelimeler",
     "teach": [{"en": "House", "tr": "Ev"}, {"en": "Water", "tr": "Su"}, {"en": "Food", "tr": "Yemek"}, {"en": "Friend", "tr": "Arkadaş"}]},
    {"id": "A1-U3", "level": "A1", "order": 3, "title": "Simple Sentences", "desc": "Basit cümle kurma (to be)",
     "teach": [{"en": "I am happy", "tr": "Mutluyum"}, {"en": "She is a teacher", "tr": "O bir öğretmen"}, {"en": "They are friends", "tr": "Onlar arkadaş"}]},
    {"id": "A2-U1", "level": "A2", "order": 1, "title": "Daily Routine", "desc": "Günlük rutin ve sıklık zarfları",
     "teach": [{"en": "I always wake up early", "tr": "Her zaman erken kalkarım"}, {"en": "She usually works", "tr": "O genellikle çalışır"}, {"en": "We sometimes travel", "tr": "Bazen seyahat ederiz"}]},
    {"id": "A2-U2", "level": "A2", "order": 2, "title": "Past Simple", "desc": "Geçmiş zaman",
     "teach": [{"en": "I went", "tr": "Gittim"}, {"en": "She ate", "tr": "O yedi"}, {"en": "They played", "tr": "Onlar oynadı"}]},
    {"id": "A2-U3", "level": "A2", "order": 3, "title": "Comparisons", "desc": "Karşılaştırma yapıları",
     "teach": [{"en": "taller than", "tr": "-den daha uzun"}, {"en": "the best", "tr": "en iyi"}, {"en": "more expensive", "tr": "daha pahalı"}]},
    {"id": "B1-U1", "level": "B1", "order": 1, "title": "Work & Social Life", "desc": "İş ve sosyal yaşam İngilizcesi",
     "teach": [{"en": "Schedule a meeting", "tr": "Toplantı ayarlamak"}, {"en": "Give advice", "tr": "Tavsiye vermek"}, {"en": "Make a decision", "tr": "Karar vermek"}]},
    {"id": "B1-U2", "level": "B1", "order": 2, "title": "Present Perfect", "desc": "Yaşanmışlık ve deneyim",
     "teach": [{"en": "I have lived here", "tr": "Burada yaşadım"}, {"en": "She has never been", "tr": "O hiç gitmedi"}, {"en": "We have finished", "tr": "Bitirdik"}]},
    {"id": "B1-U3", "level": "B1", "order": 3, "title": "Conditionals", "desc": "Koşul cümleleri",
     "teach": [{"en": "If it rains, we will stay", "tr": "Yağarsa, kalırız"}, {"en": "If I were you", "tr": "Senin yerinde olsam"}]},
    {"id": "B2-U1", "level": "B2", "order": 1, "title": "Advanced Vocabulary", "desc": "İleri iş kelimeleri",
     "teach": [{"en": "significant", "tr": "önemli"}, {"en": "to postpone", "tr": "ertelemek"}, {"en": "thorough", "tr": "titiz"}]},
    {"id": "B2-U2", "level": "B2", "order": 2, "title": "Passive & Reporting", "desc": "Edilgen yapı ve raporlama",
     "teach": [{"en": "The report was completed", "tr": "Rapor tamamlandı"}, {"en": "He suggested taking a break", "tr": "O mola vermeyi önerdi"}]},
    {"id": "B2-U3", "level": "B2", "order": 3, "title": "Complex Structures", "desc": "Karmaşık cümle yapıları",
     "teach": [{"en": "should have done", "tr": "yapmalıydı"}, {"en": "despite being tired", "tr": "yorgun olmasına rağmen"}]},
    {"id": "C1-U1", "level": "C1", "order": 1, "title": "Idioms", "desc": "İleri düzey deyimler",
     "teach": [{"en": "bite the bullet", "tr": "zoru göğüslemek"}, {"en": "cut corners", "tr": "köşe dönmek / ödün vermek"}, {"en": "get cold feet", "tr": "son anda cayma"}]},
    {"id": "C1-U2", "level": "C1", "order": 2, "title": "Inversion", "desc": "Devrik cümle yapıları",
     "teach": [{"en": "Rarely have I seen...", "tr": "Nadiren gördüm..."}, {"en": "Under no circumstances", "tr": "Hiçbir koşulda"}]},
    {"id": "C1-U3", "level": "C1", "order": 3, "title": "Academic English", "desc": "Akademik kelimeler ve kalıplar",
     "teach": [{"en": "ubiquitous", "tr": "her yerde bulunan"}, {"en": "meticulous", "tr": "titiz"}, {"en": "nothing short of", "tr": "tam anlamıyla"}]},
]

# ---------------------------------------------------------------------------
# PLACEMENT TEST (10 questions, increasing difficulty)
# ---------------------------------------------------------------------------
PLACEMENT = [
    {"id": "p1", "level": "A1", "prompt": "I ___ a doctor.", "options": ["am", "is", "are", "be"], "answer": "am"},
    {"id": "p2", "level": "A1", "prompt": "“Dog” ne demek?", "options": ["Kedi", "Köpek", "Kuş", "At"], "answer": "Köpek"},
    {"id": "p3", "level": "A2", "prompt": "Yesterday she ___ to school.", "options": ["go", "goes", "went", "going"], "answer": "went"},
    {"id": "p4", "level": "A2", "prompt": "He is ___ than me.", "options": ["tall", "taller", "tallest", "more tall"], "answer": "taller"},
    {"id": "p5", "level": "B1", "prompt": "I have ___ here for two years.", "options": ["live", "lived", "living", "lives"], "answer": "lived"},
    {"id": "p6", "level": "B1", "prompt": "If it rains, we ___ stay home.", "options": ["will", "would", "are", "have"], "answer": "will"},
    {"id": "p7", "level": "B2", "prompt": "He suggested ___ a break.", "options": ["to take", "taking", "take", "took"], "answer": "taking"},
    {"id": "p8", "level": "B2", "prompt": "If I ___ known, I would have called.", "options": ["have", "had", "would", "did"], "answer": "had"},
    {"id": "p9", "level": "C1", "prompt": "Rarely ___ such a thing.", "options": ["I have seen", "have I seen", "I saw", "did I saw"], "answer": "have I seen"},
    {"id": "p10", "level": "C1", "prompt": "“Ubiquitous” ne demek?", "options": ["Nadir", "Her yerde bulunan", "Geçici", "Gizli"], "answer": "Her yerde bulunan"},
]


def get_questions(level, qtype=None, n=None, exclude_ids=None):
    pool = [q for q in QUESTIONS if q["level"] == level]
    if qtype:
        pool = [q for q in pool if q["type"] == qtype]
    if exclude_ids:
        pool = [q for q in pool if q["id"] not in exclude_ids]
    pool = pool[:]
    random.shuffle(pool)
    if n:
        pool = pool[:n]
    return pool


def get_match_questions(level):
    """5 questions for a battle: mix of the three types."""
    types = ["word_match", "fill_blank", "word_order", "word_match", "fill_blank"]
    out = []
    for t in types:
        picks = get_questions(level, qtype=t, n=1, exclude_ids={q["id"] for q in out})
        if picks:
            out.append(picks[0])
    # top up if short
    while len(out) < 5:
        extra = get_questions(level, n=1, exclude_ids={q["id"] for q in out})
        if not extra:
            break
        out.append(extra[0])
    return out


def get_quiz_questions(unit):
    """Quiz for a lesson unit = 5 questions of that level."""
    return get_match_questions(unit["level"])
