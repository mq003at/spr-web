import { Navigate } from "react-router-dom";

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
  let dateCSV = `${dateString} ${hour}:${minute}`;

  let obj = {
    documentStamp: documentStamp,
    timeStamp: timeStamp,
    dateStamp: dateStamp,
    dateString: dateString,
    dateCSV: dateCSV,
  };

  return obj;
}

// Function generating array from startDay to endDay
const dateArr = (startDay, endDay, mode) => {
  if (mode === "arr") {
    let tempArr = [];
    const start = new Date(startDay.getTime());
    const end = new Date(endDay.getTime());
    let loop = new Date(start);
    tempArr.push(start);

    while (loop < end) {
      tempArr.push(loop);
      const newDate = loop.setDate(loop.getDate() + 1);
      loop = new Date(newDate);
    }
    return tempArr;
  } else if (mode === "range") {
    return `${startDay.toLocaleDateString("fi-FI")} - ${endDay.toLocaleDateString("fi-FI")}`;
  } else if (mode === "csv") {
    return `${startDay.toLocaleDateString("sv-SE")} ${endDay.toLocaleDateString("sv-SE")}`;
  } else {
    return "";
  }
};

/**
 * Change name string into diffent format
 *
 * @function logSchRef
 * @param {string} name - Name variable as string.
 * @param {string} option - Convert into diffrent format: "fullname" -> LastN, FirstN becomes FirstN LastN, default -> FirstN LastN becomes LastN, FirstN
 * @return {string} - Name with different string format.
 */
const nameHandler = (name, option) => {
  switch (option) {
    case "fullname": {
      const data = name.split(",");
      let firstN = data[1].split(" ");
      let lastN = data[0].split(" ");
      console.log(firstN, lastN)

      return `${firstN[1]} ${lastN[0]}`;
    }
    default: {
      const data = name.split(",");
      return `${data[1]} ${data[0]}`;
    }
  }
};

const dateHandler2 = (date, option, separator) => {
  switch (option) {
    case "DMY-int": {
      if (!separator) return null;
      else {
        let arr = date.split(separator);
        if (arr[0].length !== 2) arr[0] = "0" + arr[0];
        if (arr[1].length !== 2) arr[1] = "0" + arr[1];
        if (arr[2].length !== 4) arr[2] = "20" + arr[2];
        return parseInt(arr[2] + arr[1] + arr[0]);
      }
    }
    case "str-HM": {
      if (!date && !separator) return null;
      else {
        let time = date.substring(8,10) + separator + date.substring(10,12);
        return time;
      }
    }
    case "time-int": {
      if (!date) return null;
      else {
        let hour = parseInt(date.substring(8,10)) 
        let minute = parseInt(date.substring(10,12));
        let second = parseInt(date.substring(12,14));

        return second + minute*60 + hour*3600;
      }
    }
    case "HM-int": {
      if (separator) {
        date = date.replace(separator, "");
        let hour = parseInt(date.substring(0,2));
        let minute = parseInt(date.substring(2,4)) 

        return hour * 60 + minute;
      }
    }
    default: 
      return null;
  }
}

const getDateData = () => {
  let date = new Date();
  let year = date.getFullYear();
  let month = ("0" + (date.getMonth() + 1)).slice(-2);
  let day = ("0" + date.getDate()).slice(-2);
  let hour = ("0" + date.getHours()).slice(-2);
  let minute = ("0" + date.getMinutes()).slice(-2);
  let second = ("0" + date.getSeconds()).slice(-2);
  let documentStamp = year + month + day + hour + minute + second;
  let dateNow = `${day}-${month}-${year}`;

  let obj = {
    documentStamp: documentStamp + "Mess",
    date: dateNow,
  };
  return obj;
};

export { dateHandler, dateArr, nameHandler, dateHandler2, getDateData };
