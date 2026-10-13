const express = require('express');
const path = require('path'); // подключаем модуль для работы с путями
const app = express();
app.use(express.json());

// Подключаем раздачу статических файлов из текущей папки
app.use(express.static(__dirname));

const ansSchedule = "Расписание висит на первом этаже возле раздевалки. Или смотри в электронном дневнике.";
const ansFood = "Сегодня на обед макароны с сосиской, чай и булочка. Беги, пока всё не съели!";
const ansVacation = "Ура! Каникулы с 28 октября по 5 ноября. Выходим в школу 6-го.";
const ansExams = "ЕГЭ и ОГЭ близко... Расписание консультаций смотри на сайте школы. Главное — выспаться!";
const ansDuty = "График дежурств по классу висит на доске информации. Сменку проверять обязательно!";
const ansLate = "Если опоздал — бегом за дневником к завучу, потом в класс.";
const ansHomework = "Домашку смотри в электронном дневнике, я не всё знаю.";
const ansCompetition = "Школьные проекты сдаем до конца месяца. Десятые классы, вас это касается в первую очередь! Защита в актовом зале.";
const ansGreeting = "Привет! Я школьный бот. Спроси меня про уроки, столовую, экзамены, секции или правила школы.";
const ansMath = "Математичка сегодня злая, лучше сделай домашку. Алгебра в 305-м, геометрия там же.";
const ansInformatics = "Информатика на 3 этаже в 312 кабинете. И да, к ЕГЭ по Питону лучше начинать готовиться уже сейчас!";
const ansAdmin = "Директор в 201 кабинете, завуч в 202. Если вызывают на ковер — крепись.";
const ansLost = "Все потеряшки несут на вахту. Если забыл сменку, наушники или ключи — ищи у охранника дяди Васи.";
const ansRules = "В туалетах не парить, за школой не курить! Поймают — сразу вызовут родителей к директору.";
const ansGrades = "Оценки в электронном журнале. Исправить двойки нужно до конца недели, иначе зачет не поставят.";
const ansMedical = "Медпункт на первом этаже налево. Если болит голова, нужен пластырь или справка — тебе туда. Работают до 15:00.";
const ansClubs = "После уроков работает спортзал (волейбол и баскетбол), а по средам — кружок по программированию.";
const ansEvents = "Новогодняя дискотека будет 25 декабря. Деньги на билеты сдаем старосте до пятницы.";

const db = {
  "расписани": ansSchedule,
  "урок": ansSchedule,
  "пар": ansSchedule,
  "кабинет": ansSchedule,
  "какой щас": ansSchedule,
  "звонок": ansSchedule,
  "перемен": ansSchedule,
  "столов": ansFood,
  "еда": ansFood,
  "покушать": ansFood,
  "обед": ansFood,
  "жрать": ansFood,
  "буфет": ansFood,
  "пицц": ansFood,
  "пирожок": ansFood,
  "каникул": ansVacation,
  "отдых": ansVacation,
  "четверт": ansVacation,
  "праздник": ansVacation,
  "егэ": ansExams,
  "огэ": ansExams,
  "экзамен": ansExams,
  "пробник": ansExams,
  "консультац": ansExams,
  "дежурн": ansDuty,
  "убирать": ansDuty,
  "мыть": ansDuty,
  "сменк": ansDuty,
  "обувь": ansDuty,
  "опоздал": ansLate,
  "проспал": ansLate,
  "задержал": ansLate,
  "прогул": ansLate,
  "д/з": ansHomework,
  "домашк": ansHomework,
  "задали": ansHomework,
  "матеш": ansMath,
  "алгебр": ansMath,
  "геометри": ansMath,
  "информ": ansInformatics,
  "питон": ansInformatics,
  "python": ansInformatics,
  "программирован": ansInformatics,
  "компы": ansInformatics,
  "проект": ansCompetition,
  "конкурс": ansCompetition,
  "хакатон": ansCompetition,
  "олимпиад": ansCompetition,
  "10 класс": ansCompetition,
  "десятый": ansCompetition,
  "директор": ansAdmin,
  "завуч": ansAdmin,
  "секретар": ansAdmin,
  "учительск": ansAdmin,
  "потерял": ansLost,
  "нашел": ansLost,
  "украли": ansLost,
  "забыл": ansLost,
  "пропал": ansLost,
  "наушник": ansLost,
  "кури": ansRules,
  "вейп": ansRules,
  "электрон": ansRules,
  "туал": ansRules,
  "пари": ansRules,
  "оценк": ansGrades,
  "двойк": ansGrades,
  "журнал": ansGrades,
  "долг": ansGrades,
  "исправит": ansGrades,
  "зачет": ansGrades,
  "медп": ansMedical,
  "врач": ansMedical,
  "голова": ansMedical,
  "справк": ansMedical,
  "живот": ansMedical,
  "таблет": ansMedical,
  "секци": ansClubs,
  "кружок": ansClubs,
  "волейбол": ansClubs,
  "баскетбол": ansClubs,
  "доп": ansClubs,
  "спортзал": ansClubs,
  "дискотек": ansEvents,
  "новый год": ansEvents,
  "мероприяти": ansEvents,
  "выпускной": ansEvents,
  "привет": ansGreeting,
  "здравствуй": ansGreeting,
  "хай": ansGreeting,
  "ку": ansGreeting,
  "бот": ansGreeting
};

// Главная страница отдает фронтенд
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/message', function(req, res) {
  let userText = req.body.text.toLowerCase();
  let botAnswer = "Я еще тупой бот, спроси меня про расписание, столовую, проекты или оценки.";

  for (let key in db) {
    if (userText.includes(key)) {
      botAnswer = db[key];
      break; 
    }
  }

  res.json({ answer: botAnswer });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log("Бот запущен на порту " + PORT);
});