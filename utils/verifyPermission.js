const verifyPermission = (currentUser, requestedUserId) => {
  const { userId, role } = currentUser;
  if (role !== "admin") {
    if (requestedUserId !== userId) return false;
  }
  return true;
};

module.exports = verifyPermission;
