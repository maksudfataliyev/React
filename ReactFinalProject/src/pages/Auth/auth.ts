export function saveUser(username: string, password: string) {
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  users[username] = password;
  localStorage.setItem('users', JSON.stringify(users));
}

export function validateUser(username: string, password: string): boolean {
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  return users[username] === password;
}
