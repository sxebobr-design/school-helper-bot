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

// Запрос к модели Qwen 2.5 через OpenRouter
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
        model: 'qwen/qwen-2.5-72b-instruct',
        messages: [
          {
            role: 'system',
            content: `Ты official школьный бот-помощник ГБОУ "Школа № 1770" Москвы (Коломенская наб., 20, директор — Горемыкин М.Ю.).
В школе есть профильные классы (медицинский, инженерный, медиакласс) и спортклуб "Импульс".
Заказ питания и выбор меню в нашей школе происходит через портал mos.ru (сервис "Москвёнок").
ОБЯЗАТЕЛЬНО отвечай СТРОГО на русском языке, коротко, дружелюбно и с легким юмором.`
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
    res.json({ answer: "Ошибка соединения с сервером Qwen." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Бот запущен на порту ${PORT}`));