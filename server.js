const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Настройка CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Официальная база знаний ГБОУ "Школа № 1770" с сайта школы
const SCHOOL_KNOWLEDGE_BASE = `
ОФИЦИАЛЬНАЯ ИНФОРМАЦИЯ ГБОУ "ШКОЛА № 1770":
- Название: Государственное бюджетное общеобразовательное учреждение города Москвы "Школа № 1770".
- Главный адрес: г. Москва, Коломенская набережная, дом 20.
- Директор: Михаил Юрьевич Горемыкин.
- Официальный сайт: sch1770.mskobr.ru.

ОСНОВНЫЕ РАЗДЕЛЫ И ПРАВИЛА:
1. Питание и Столовая:
   - Заказ питания, выбор меню и пополнение карты школьника происходит строго через портал mos.ru в сервисе "Москвёнок".
   - В столовой доступно горячее комплексное питание (завтраки, обеды) и буфетная продукция.

2. Профильные классы:
   - Медицинский класс (углубленное изучение биологии и химии, сотрудничество с медуниверситетами).
   - Инженерный класс (углубленная математика, физика, информатика, робототехника).
   - Медиакласс (журналистика, медиакоммуникации, блогинг, фото/видеопроизводство).

3. Дополнительное образование и спорт:
   - Школьный спортивный клуб (ШСК) "Импульс" (секции по футболу, волейболу, баскетболу, единоборствам и ритмике).
   - Творческие кружки, музыкальное и художественное направление.

4. Прочие школьные вопросы:
   - Расписание уроков, каникул и домашнее задание доступны в Электронном дневнике МЭШ (mes.mos.ru).
   - Для посещения медпункта или получения справок нужно обращаться к школьному медицинскому работнику.
`;

app.post('/api/message', async (req, res) => {
  const userText = req.body?.text || "";
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.json({ answer: "Ошибка: на сервере не настроен OPENROUTER_API_KEY." });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-coder-32b-instruct',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: `Ты — официальный бот-помощник ГБОУ "Школа № 1770".

СТРОГИЕ ПРАВИЛА И ОГРАНИЧЕНИЯ:
1. Отвечай ТОЛЬКО на вопросы, касающиеся школы № 1770, учебы, питания, кружков и школьной жизни.
2. Используй исключительно следующие официальные данные:
${SCHOOL_KNOWLEDGE_BASE}
3. Если пользователь спрашивает о чем-то, чего НЕТ в этой базе знаний (например, сторонние темы, физика/история за пределами школы, личные вопросы, программирование, игры), вежливо ответь:
"Я могу отвечать только на вопросы про ГБОУ Школа № 1770 и школьную жизнь. Пожалуйста, задай вопрос о расписании, столовой, профильных классах или кружках!"
4. Никогда не придумывай факты. Если вопрос про школу, но конкретных деталей нет в базе, отправляй на официальный сайт sch1770.mskobr.ru или в МЭШ.
5. Отвечай СТРОГО на русском языке, вежливо, коротко и понятным языком.`
          },
          {
            role: 'user',
            content: userText
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.json({ answer: `Ошибка Qwen API: ${data.error.message}` });
    }

    const botAnswer = data.choices?.[0]?.message?.content;
    if (!botAnswer) {
      return res.json({ answer: "Нейросеть вернула пустой ответ. Попробуй ещё раз!" });
    }
    
    res.json({ answer: botAnswer.trim() });
  } catch (err) {
    console.error("Ошибка сервера:", err);
    res.json({ answer: "Ошибка соединения с сервером." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Бот запущен на порту ${PORT}`));