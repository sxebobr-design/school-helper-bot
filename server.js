const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// База знаний ГБОУ Школа № 1770
const SCHOOL_KNOWLEDGE_BASE = `
Официальная база знаний ГБОУ Школа № 1770 (г. Москва):
- Директор: Горемыкин Михаил Юрьевич (тел: +7 (499) 615-89-88).
- Корпус № 1 (Основной): Коломенская наб., д. 20.
- Корпус № 2: ул. Судостроительная, д. 43, корп. 2.
- Корпус «Фрегат»: ул. Корабельная, д. 13А.
- Расписание звонков (обычные классы): 1 урок 08:30 – 09:15, далее перемены по 10-20 минут.
- Кадетские классы: усиленная подготовка, строевая, самоподготовка с 15:30 до 17:00.
- Каникулы (триместры 2026-2027): осенние 24.10.2026 – 01.11.2026, зимние 31.12.2026 – 10.01.2027, весенние 03.04.2027 – 11.04.2027.
- Питание: карта «Москвёнок», заказ на mos.ru. Дневник: МЭШ.
`;

// Поддерживаем ОБА возможных варианта эндпоинта (/api/chat и /api/message), 
// чтобы фронтенд в любом случае достучался без ошибок 404!
const handleChat = async (req, res) => {
  const message = req.body?.message || req.body?.text;

  if (!message) {
    return res.status(400).json({ error: 'Сообщение не может быть пустым' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-coder-32b-instruct',
        messages: [
          { role: 'system', content: SCHOOL_KNOWLEDGE_BASE },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Не удалось получить ответ.';

    // Отдаем ответ сразу в нескольких форматах ключей, чтобы фронтенд точно его прочитал
    res.json({ reply: reply, answer: reply });
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Ошибка при обработке запроса' });
  }
};

app.post('/api/chat', handleChat);
app.post('/api/message', handleChat);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});