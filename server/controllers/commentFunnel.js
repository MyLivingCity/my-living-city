// adapted from UBC_MDSCL 2023-2024 Capstone Team. Uses the DeepInfra API with the Meta Llama 3 large language model

const funnelPrompt = "Given a sentence, analyze its tone as either 'Positive', 'Negative', or 'Neutral' and summarize the top keywords. Make sure Format your output as follows: 0. [Tone] | 1. [Attitude(verb)] | 2. [Keyword1] | 3. [Keyword2] | 4. [Keyword3] | 5. [Keyword4] | 6. [Keyword5]\n Ensure that the keywords are relevant and capture the essence of the sentence. Try to identify the agents (action initiators) and patients (action recipients) in keywords. Do not explain or give any other content! Just seven tag! You only only only need to give me the tags. The sentence is: ";

const apiKey = DEEPINFRA_API_KEY;

async function generateApi(query) {
  const response = await fetch('https://api.deepinfra.com/v1/openai/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'meta-llama/Meta-Llama-3-8B-Instruct',
      messages: [{ role: 'user', content: query }],
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function funnelCommentApi(newComment) {
  const query = funnelPrompt + newComment;
  const responseData = await generateApi(query);

  const responseContent = responseData.split('\n')[0].split(' | ');
  const newCommentWords = [];

  for (const item of responseContent) {
    try {
      newCommentWords.push(item.split('. ')[1]);
    } catch (error) {
      continue;
    }
  }

  // Make sure the length of the list is 7
  if (newCommentWords.length < 7) {
    newCommentWords.push(...Array(7 - newCommentWords.length).fill('None'));
  } else if (newCommentWords.length > 7) {
    newCommentWords.length = 7;
  }

  // Use an object to store them
  const commentTags = {
    Tone: newCommentWords[0],
    Attitude: newCommentWords[1],
    Keyword1: newCommentWords[2],
    Keyword2: newCommentWords[3],
    Keyword3: newCommentWords[4],
    Keyword4: newCommentWords[5],
    Keyword5: newCommentWords[6],
  };

  return commentTags;
}

// Example usage
const newComment = "Your sentence here.";
funnelCommentApi(newComment).then(commentTags => {
  console.log(commentTags);
});
