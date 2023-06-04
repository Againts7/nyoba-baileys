const { Configuration, OpenAIApi } = require('openai');

const API_KEY = '';

async function chatAIhandler(pesanIsiCommand) {
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
        console.log(`${error} ini error`);
        console.log(error.response.data);
        return `${error}`;
      }
      throw new Error(`Maaf, sepertinya ada yang error: ${error.message}`);
    }
  }
  return ChatGPTRequest(pesanIsiCommand);
}

module.exports = chatAIhandler;
