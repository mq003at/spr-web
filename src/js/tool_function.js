// Functions handles the date
function dateHandler(date) {
  /**
   * Receive a Date() and return an object. Possible return: documentStamp, timeStamp, dateStamp (int), dateString.
   */
  let year = date.getFullYear();
  let month = ("0" + (date.getMonth() + 1)).slice(-2);
  let day = ("0" + date.getDate()).slice(-2);
  let hour = ("0" + date.getHours()).slice(-2);
  let minute = ("0" + date.getMinutes()).slice(-2);
  let second = ("0" + date.getSeconds()).slice(-2);
  let milisec = ("" + date.getMilliseconds()).slice(-1);
  let documentStamp = year + month + day + hour + minute + second + milisec;
  let timeStamp = year + month + day + hour + minute + second;
  let dateStamp = parseInt(year + month + day);
  let dateString = year + "-" + month + "-" + day;

  let obj = {
    documentStamp: documentStamp,
    timeStamp: timeStamp,
    dateStamp: dateStamp,
    dateString: dateString,
  };

  return obj;
}

export { dateHandler };
