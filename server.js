const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const LWAuth = require("./lw-auth");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.post('/callback', async (req, res) => {
    const event = req.body;
    console.log('Received event:', event);

    if (event.type === 'message' && event.content.type === 'text') {
        const userId = event.source.userId;
        const receivedText = event.content.text;

        // ここで受け取ったテキストを基に返信メッセージを作成
        const replyText = `あなたのメッセージ: ${receivedText}`;

        // メッセージを送信する関数を呼び出し
        await sendMessage(userId, replyText);
    }

    res.sendStatus(200);
});

const sendMessage = async (userId, text) => {
    const botId = '6806734'; // ここにBot IDを入力
    const accessToken = await LWAuth.getAccessToken(); // ここにAccess Tokenを入力

    const url = `https://www.worksapis.com/v1.0/bots/${botId}/users/${userId}/messages`;

    const message = {
        content: {
            type: 'text',
            text: text
        }
    };

    try {
        await axios.post(url, message, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});