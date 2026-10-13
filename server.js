const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

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
            text: `Ты официальный и дружелюбный школьный бот-помощник ГБОУ "Школа № 1770" Москвы (Коломенская наб., 20, директор — Горемыкин М.Ю.). В школе есть профильные классы (медицинский, инженерный, медиакласс) и спортклуб "Импульс". Отвечай коротко и с юмором. Вопрос ученика: ${userText}`
          }]
        }]
      })
    });

    const data = await response.json();
    console.log("Ответ от Google API:", JSON.stringify(data));

    if (data.error) {
      return res.json({ answer: `Ошибка Google API: ${data.error.message}` });
    }

    const botAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!botAnswer) {
      return res.json({ answer: "Нейросеть вернула пустой ответ. Попробуй другой вопрос!" });
    }
    
    res.json({ answer: botAnswer.trim() });
  } catch (err) {
    console.error("Ошибка сервера:", err);
    res.json({ answer: "Ошибка соединения с сервером нейросети." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Бот запущен на порту ${PORT}`));