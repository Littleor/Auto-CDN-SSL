const store = new Map<string, string>();

export function setChallenge(token: string, keyAuthorization: string) {
  store.set(token, keyAuthorization);
}

export function getChallenge(token: string): string | undefined {
  return store.get(token);
}

export function removeChallenge(token: string) {
  store.delete(token);
}
