import { History } from 'history';

let rootHistory: History;

export const getHistory = (): History | undefined => {
  return rootHistory;
};

export const setHistory = (history: History) => {
  rootHistory = history;
};
