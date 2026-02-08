// Action creators (optional convenience)

export const inputToken = ({ id, token }) => ({ type: 'INPUT_TOKEN', id, token });
export const clearCalc = ({ id }) => ({ type: 'CLEAR', id });
export const backspace = ({ id }) => ({ type: 'BACKSPACE', id });
export const evaluate = ({ id }) => ({ type: 'EVALUATE', id });
export const transfer = ({ fromId, toId }) => ({ type: 'TRANSFER', fromId, toId });
export const setSetting = ({ key, value }) => ({ type: 'SET_SETTING', key, value });
