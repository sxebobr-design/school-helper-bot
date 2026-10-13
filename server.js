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
        model: 'qwen/qwen-2.5-72b-instruct', // Подключаем Qwen 2.5 72B
        messages: [
          {
            role: 'system',
            content: 'Ты официальный и дружелюбный школьный бот-помощник ГБОУ "Школа № 1770" Москвы (Коломенская наб., 20, директор — Горемыкин М.Ю.). В школе есть профильные классы (медицинский, инженерный, медиакласс) и спортклуб "Импульс". Отвечай коротко, понятным языком и с легким юмором.'
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
      return res.json({ answer: `Ошибка OpenRouter API: ${data.error.message}` });
    }

    const botAnswer = data.choices?.[0]?.message?.content;
    if (!botAnswer) {
      return res.json({ answer: "Нейросеть вернула пустой ответ. Попробуй еще раз!" });
    }
    
    res.json({ answer: botAnswer.trim() });
  } catch (err) {
    console.error("Ошибка сервера:", err);
    res.json({ answer: "Ошибка соединения с сервером Qwen." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Бот запущен на порту ${PORT}`));