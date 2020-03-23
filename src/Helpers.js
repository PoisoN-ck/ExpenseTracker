export function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function sortTransactionsByDate(currentTrans, nextTrans) {
  return nextTrans.transDate - currentTrans.transDate;
}
