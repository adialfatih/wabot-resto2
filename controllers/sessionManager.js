const sessions = {};

function getSession(nomor) {
  return sessions[nomor];
}

function setSession(nomor, data) {
  sessions[nomor] = { ...sessions[nomor], ...data };
}

function clearSession(nomor) {
  delete sessions[nomor];
}

module.exports = { getSession, setSession, clearSession };
