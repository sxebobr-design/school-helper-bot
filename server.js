const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Настройка CORS для безопасной связи с GitHub Pages
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Раздача статических файлов сайта
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API-эндпоинт для связи с ИИ-помощником школы № 1770
app.post('/api/message', async (req, res) => {
  const userText = req.body?.text || "";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({ answer: "Ошибка: на сервере не настроен GEMINI_API_KEY." });
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Ты официальный, крутой и дружелюбный школьный бот-помощник ГБОУ "Школа № 1770" города Москвы (адрес: Коломенская набережная, д. 20, директор — Горемыкин Михаил Юрьевич). В школе есть профильные классы (медицинский, инженерный, медиакласс), волонтерский отряд и спортивный клуб "Импульс". Отвечай на вопросы учеников коротко, понятно, с юмором и с учетом специфики школы № 1770. Вопрос ученика: ${userText}`
          }]
        }]
      })
    });

    const data = await response.json();
    const botAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Я задумался... Спроси что-нибудь другое про школу!";
    
    res.json({ answer: botAnswer.trim() });
  } catch (err) {
    console.error("Ошибка Gemini API:", err);
    res.json({ answer: "Нейросеть ушла на переменку, попробуй отправить сообщение еще раз через секунду!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Бот Школы 1770 успешно запущен на порту ${PORT}`);
});