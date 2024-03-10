
/**
 * Checks if a user is authorized to create a new user of a certain role
 * or in a certain Super Segment or Segment.
 * 
 * @param userToCreate user that is being created
 * @param user user that is creating the new user
 */
function checkUserCreationAuthorization(userToCreate, user) {
  // TODO implement this function
  console.error('\x1b[31m%s\x1b[0m', 'Unimplemented checkUserCreationAuthorization');
  console.error('userToCreate:', userToCreate)
  console.error('userCreatingAccount:', user)
  return true // or false
}

module.exports = {
  checkUserCreationAuthorization
}