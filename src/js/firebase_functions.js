import { child, equalTo, onValue, orderByChild, query, update } from "firebase/database";
import * as fb from "./firebase_init";

const shopId = sessionStorage.getItem("shop_id")

/**
 * Cache employeeList into sessionStorage as JSON String. Use JSON.paarse(sessionStorage.getItem("cache_emp_list")) to retrieve employeeList. The cache will be removed after 5 seconds.
 *
 * @function cacheEmployeeList
 * @params  This function does not receive any params since it only need shopID from sessionStorage.
 * @returns {Object} employeeList as Object. Use Object.keys(val).forEach to get the data you want.
 */
const cacheEmployeeList = () => {
  let data = "";
  onValue(
    fb.empRef(shopId),
    (snap) => {
      data = snap.val();
    },
    { onlyOnce: true }
  );

  sessionStorage.setItem("cache_emp_list", JSON.stringify(data));
  setTimeout(sessionStorage.removeItem("cache_emp_list"), 5000);
  return data;
};

/**
 * Get the name, return the ID, using shopID from session.
 *
 * @function findId
 * @param {String} name Full name of the person
 * @returns ID of that person, null if the person cannot be found.
 */
const findId = (name) => {
  let empList = "";
  let sEmpList = sessionStorage.getItem("cache_emp_list");
  let returnValue = "";

  if (!sEmpList) empList = cacheEmployeeList();
  else empList = JSON.parse(sEmpList);

  Object.keys(empList).forEach((groupID) => {
    const qName = query(child(fb.empRef(shopId), `${groupID}/employees`), orderByChild("name"), equalTo(name));
    onValue(
      qName,
      (snap) => {
        let val = snap.val();
        if (val) {
          let key = Object.keys(val)[0];
          returnValue = val[key].tag_id;
        }
      },
      { onlyOnce: true }
    );
  });

  if (returnValue) return returnValue;
  else {
    console.log("Missing: ", name);
    return null;
  }
};

/**
 * Write the schedule to firebase server. Shop ID will be taken from session.
 *
 * @function addSchedule
 * @param {String} id id of employee
 * @param {int} dateStamp day of the schedule
 * @param {String} inStamp login time
 * @param {String} outStamp logouttime
 * @param {boolean} isOvertime true if the employee can work overtime. If not declare, this will be false by default.
 *
 * @return String of the error if there is problem
 */
const addSchedule = (id, dateStamp, inStamp, outStamp, isOvertime) => {
  if (!isOvertime) isOvertime = false;
  if (!id) return "Cannot get the ID of the employee. Please check your input.";
  if (!dateStamp) return "Something wrong with the date. Please check your input.";
  if (!inStamp) return "Cannot get the login Stamp. Please check your input.";
  if (!outStamp) return "Cannot get the logout Stamp. Please check your input.";

  update(child(fb.logSchRef(shopId, id), "/" + dateStamp + id + "Sch"), {
    dateStamp: dateStamp,
    inStamp: inStamp,
    outStamp: outStamp,
  });

  return null;
};



export { addSchedule, findId };
