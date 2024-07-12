// adapted from UBC_MDSCL 2023-2024 Capstone Team. Uses the DeepInfra API with the Meta Llama 3 large language model
require('dotenv').config();
const OpenAI = require('openai');
const { DEEPINFRA_API_KEY } = require('../lib/constants');
const { PrismaClient } = require('@prisma/client')
const prisma = require('../lib/prismaClient');
const funnelPrompt = "Given a sentence, analyze its tone as either 'Positive', 'Negative', or 'Neutral' and summarize the top keywords. Make sure to format your output as follows: [Tone] | [Attitude(verb)] | [Keyword1] | [Keyword2] | [Keyword3] | [Keyword4] | [Keyword5]\n Ensure that the keywords are relevant and capture the essence of the sentence. Try to identify the agents (action initiators) and patients (action recipients) in keywords. Do not explain or give any other content! Just seven tags! You only only only need to give me the tags. The sentence is: ";

const apiKey = DEEPINFRA_API_KEY;

const openai = new OpenAI({
    baseURL: 'https://api.deepinfra.com/v1/openai',
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, 
});

async function isCheckSimilarEnabled() {
  try {
    const featureToggle = await prisma.feature_Toggle.findUnique({
      where: { featureName: 'checkSimilar' },
      select: { isEnabled: true}
    });
    return featureToggle.isEnabled;
  } catch (error){
      return false;
  }
}

async function funnelCommentApi(newComment) {
    const query = funnelPrompt + newComment;
    const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: query }],
        model: 'meta-llama/Meta-Llama-3-8B-Instruct',
    })
    .catch(async (err) => {
      if (err instanceof OpenAI.APIError) {
        console.log(err);
      } else {
        console.log(err);
        throw err;
      }
    });

    let commentKeywords = [];
    if (completion) {
      commentKeywords = completion.choices[0].message.content.toLowerCase().split(' | ');
    }

    // Make sure the length of the list is 7
    if (commentKeywords.length < 7) {
        commentKeywords.push(...Array(7 - commentKeywords.length).fill('none'));
    } else if (commentKeywords.length > 7) {
        commentKeywords.length = 7;
    }

    // Use an object to store them
    const commentTags = {
        tone: commentKeywords[0],
        attitude: commentKeywords[1],
        keywords: {
          keyword1: commentKeywords[2],
          keyword2: commentKeywords[3],
          keyword3: commentKeywords[4],
          keyword4: commentKeywords[5],
          keyword5: commentKeywords[6],
        },
    };
    await prisma.$disconnect();
    return commentTags;
}

async function checkSimilar(commentKeywords, ideaId, loggedInUser) {
    const enabled = await isCheckSimilarEnabled();

    let similarCommentArray = [];
    let similarityCountArray = [];
    
    if(enabled) {
      const prismaLikesAndDislikesQuery = {
        likes: {
          where: {
            authorId: loggedInUser?.id
          }
        },
        dislikes: {
          where: {
            authorId: loggedInUser?.id
          }
        }
      }

      const commentsQuery = await prisma.ideaComment.findMany({
        where: { ideaId: ideaId },
        include: {
          _count: {
            select: {
              likes: true,
              dislikes: true,
            }
          },
          author: {
            select: {
              id: true,
              email: true,
              fname: true,
              lname: true,
              organizationName: true,
              userType: true,
              userSegments: {
                select: {
                  id: true,
                  homeSegmentId: true,
                  workSegmentId: true,
                  schoolSegmentId: true,
                  homeSubSegmentId: true,
                  workSubSegmentId: true,
                  schoolSubSegmentId: true,
                  homeSegHandle: true,
                  workSegHandle: true,
                  schoolSegHandle: true,
                }
              },
              address: {
                select: {
                  streetAddress: true,
                  postalCode: true,
                }
              }
            }
          },
          // userSeg: {
          //   select: {
          //     id: true,
          //     homeSegmentId: true,
          //     workSegmentId: true,
          //     schoolSegmentId: true,
          //   }
          // },
          idea: {
            select: {
              id: true,
              segmentId: true,
              subSegmentId: true
            }
          },
          // userSeg: {
          //   select: {
          //     id: true,
          //     homeSegmentId: true
          //   }
          // },

          ...loggedInUser && { ...prismaLikesAndDislikesQuery }
        },
        orderBy: [
          {
            likes: {
              _count: 'desc'
            }
          },
          {
            updatedAt: 'desc'
          },
        ]
      });

      const comments = commentsQuery.map(commentQuery => ({
        ...commentQuery,
        likes: commentQuery.likes ?? [],
        dislikes: commentQuery.dislikes ?? [],
      }))

      comments.forEach(comment => {
        let keywordCount = 0;
        //only check if comments are similar if they have the same tone
        if (commentKeywords.tone === comment.tone) {
          keywordCount++;
          if (commentKeywords.attitude === comment.attitude) {
            keywordCount++;
          }
          for (const value of Object.values(commentKeywords.keywords)) {
            if (value !== 'none' && value !== '') {
              for (const commentValue of Object.values(comment.keywords)) {
                if(value === commentValue) {
                  keywordCount++;
                  break;
                }
              }
            }
          }
        }
        if (keywordCount > 3) {
          similarCommentArray.push(comment);
          similarityCountArray.push(keywordCount);
        }
      });
      while (similarCommentArray.length > 5) {
        // find index of least similar comment
        let minIndex = similarityCountArray.indexOf(Math.min(...similarityCountArray));
        similarCommentArray.splice(minIndex, 1);
        similarityCountArray.splice(minIndex, 1);
      }
    }
    await prisma.$disconnect();
    return similarCommentArray;
}

module.exports = {
  funnelCommentApi,
  checkSimilar,
};