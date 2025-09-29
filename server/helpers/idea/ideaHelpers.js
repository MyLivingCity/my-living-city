const isInteger = (val) => Number.isInteger(val);
const fs = require('fs');
const path = require('path');

function loadIdeaErrors() {
  const filePath = path.join(__dirname, 'ideaErrorMessages.json');
      
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function validateIdeaPostingAccess({
  userId,
  segmentId,
  categoryId,
  banned,
  userSegments
}) {
  let error = '';
  let errorMessage = '';
  let errorStack = '';

  const {
    homeSuperSegId,
    workSuperSegId,
    schoolSuperSegId,
    homeSegmentId,
    workSegmentId,
    schoolSegmentId,
    homeSubSegmentId,
    workSubSegmentId,
    schoolSubSegmentId, 
    prisma
  } = userSegments;

  if (banned === 'true') banned = true;

  if (banned === true) {
    error += 'You are banned';
    errorMessage += 'You must be un-banned before you can post ideas';
    errorStack += 'Users can not post ideas with a pending ban status of true';
  }

  const ideaErrors = loadIdeaErrors();
  
  // check to make sure that the user is apart of one of the sub/super segments. 
  // it can be any of the home/work/school segmentIds 
  // then if we dont find a match then we throw an error with the correct message
  
  if (!categoryId || !isInteger(categoryId)) {
    error += ideaErrors.missingCategoryId.error
    errorMessage += ideaErrors.missingCategoryId.errorMessage 
    errorStack += ideaErrors.missingCategoryId.errorStack

    const theCategory = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!theCategory) {
      error += ideaErrors.missingCategoryId.error
      errorMessage += ideaErrors.missingCategoryId.errorMessage  
      errorStack += ideaErrors.missingCategoryId.errorStack 
    }
  }
  return { error, errorMessage, errorStack };
}

module.exports = { validateIdeaPostingAccess };

