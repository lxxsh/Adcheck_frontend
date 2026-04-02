const USERS_KEY = "mockUsers";
const LEGACY_USER_KEY = "mockUser";
const CURRENT_USER_KEY = "currentUser";
const LOGIN_KEY = "isLoggedIn";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function migrateLegacyUser() {
  const users = readJson(USERS_KEY, []);

  if (users.length > 0) {
    return users;
  }

  const legacyUser = readJson(LEGACY_USER_KEY, null);

  if (!legacyUser) {
    return [];
  }

  const migratedUsers = [legacyUser];
  writeJson(USERS_KEY, migratedUsers);
  return migratedUsers;
}

export function getUsers() {
  const users = migrateLegacyUser();
  return Array.isArray(users) ? users : [];
}

export function findUserById(id) {
  return getUsers().find((user) => user.id === id) || null;
}

export function registerUser(user) {
  const users = getUsers();

  if (users.some((item) => item.id === user.id)) {
    throw new Error("\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC544\uC774\uB514\uC785\uB2C8\uB2E4.");
  }

  const nextUsers = [...users, user];
  writeJson(USERS_KEY, nextUsers);
  writeJson(LEGACY_USER_KEY, user);
  return user;
}

export function loginUser(id, password) {
  const user = findUserById(id);

  if (!user || user.password !== password) {
    return null;
  }

  localStorage.setItem(LOGIN_KEY, "true");
  writeJson(CURRENT_USER_KEY, user);
  return user;
}

export function logoutUser() {
  localStorage.removeItem(LOGIN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser() {
  return readJson(CURRENT_USER_KEY, null);
}

export function updateCurrentUserProfile(updates) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    throw new Error("\uB85C\uADF8\uC778 \uC815\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }

  const users = getUsers();
  const duplicateUser = users.find(
    (user) => user.id === updates.id && user.id !== currentUser.id
  );

  if (duplicateUser) {
    throw new Error("\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC544\uC774\uB514\uC785\uB2C8\uB2E4.");
  }

  const nextUser = {
    ...currentUser,
    ...updates,
  };

  const nextUsers = users.map((user) =>
    user.id === currentUser.id ? nextUser : user
  );

  writeJson(USERS_KEY, nextUsers);
  writeJson(CURRENT_USER_KEY, nextUser);
  writeJson(LEGACY_USER_KEY, nextUser);

  return nextUser;
}

