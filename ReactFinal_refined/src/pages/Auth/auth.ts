export function saveUser(
  username: string,
  password: string,
  profilePic?: string,
  email?: string
) {
  const users = JSON.parse(localStorage.getItem('users') || '{}');

  users[username] = {
    password,
    profilePic,
    email
  };

  localStorage.setItem('users', JSON.stringify(users));
}

export function validateUser(username: string, password: string): boolean {
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  return users[username]?.password === password;
}

export function getUsers(): Record<string, { password: string; profilePic?: string; email?: string }> {
  return JSON.parse(localStorage.getItem('users') || '{}');
}

export function isUsernameTaken(username: string): boolean {
  const users = getUsers();
  return Boolean(users[username]);
}

export function isEmailTaken(email: string): boolean {
  const users = getUsers();
  return Object.values(users).some(user => user.email === email);
}
