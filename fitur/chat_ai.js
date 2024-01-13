const { Configuration, OpenAIApi } = require('openai');

const API_KEY = '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';

async function chatAIhandler(msgContext) {
  const { msg, repliedMsg } = msgContext;
  const teks = msg || repliedMsg;
  async function ChatGPTRequest(teksKeOpenAI) {
    try {
      const configuration = new Configuration({
        apiKey: API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: teksKeOpenAI }],
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response) {
        console.log(` ini error di chat_ai ${error}`);
        let emsg = '';
        emsg += `${error}\n${error.response.data.error.message}`;
        return `${emsg}`;
      }
      throw new Error(`Maaf, sepertinya ada yang error: ${error.message}`);
    }
  }
  const hasil = await ChatGPTRequest(teks);
  const msgContex = msgContext;
  msgContex.text = hasil;
  msgContex.type = 'text';
  return msgContex;
}

module.exports = { chatAIhandler };
