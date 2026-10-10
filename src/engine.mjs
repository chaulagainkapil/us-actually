export function normalizeWord(value) {
  if (typeof value !== 'string') throw new Error('Type a word first.');
  const word = value.normalize('NFKC').trim().toLowerCase();
  if (!/^[\p{L}]+(?:[-'][\p{L}]+)*$/u.test(word) || word.length > 40) throw new Error('Use one word, up to 40 letters.');
  return word;
}
export function submit(room, player, round, value) {
  if (room.players.length !== 2) throw new Error('Wait for your friend to join.');
  if (room.won) throw new Error('This game is finished.');
  if (round !== room.history.length + 1) throw new Error('Round changed. Please try again.');
  if (room.guesses[player] !== undefined) throw new Error('Your word is already locked in.');
  room.guesses[player] = normalizeWord(value);
  if (Object.keys(room.guesses).length === 2) {
    const words = room.players.map(p => room.guesses[p.token]);
    room.won = words[0] === words[1];
    room.history.push({ words, matched: room.won });
    room.guesses = {};
  }
}
export function view(room, token) {
  return { code: room.code, playerIndex: room.players.findIndex(p => p.token === token), players: room.players.map(p => p.name), round: room.history.length + 1, history: room.history, won: room.won, locked: room.guesses[token] !== undefined, waiting: Object.keys(room.guesses).length > 0, rematchVotes: room.votes.length };
}
export function voteRematch(room, token) {
  if (!room.won) throw new Error('Finish this game first.');
  if (!room.votes.includes(token)) room.votes.push(token);
  if (room.votes.length === 2) { room.history = []; room.guesses = {}; room.won = false; room.votes = []; }
}
