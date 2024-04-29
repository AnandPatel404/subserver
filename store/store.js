const store = new Map();

export const createSessionInStore = (k, v) => {
	store.set(k, v);
};
export const getSession = async (sessionId) => {
	const a = await store.get(sessionId);
	return a;
};
export const hasSession = async (sessionId) => {
	const a = store.has(sessionId);
	return a;
};
export const destroySession = async (sessionId) => {
	store.delete(sessionId);
};
