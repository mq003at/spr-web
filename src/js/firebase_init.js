import { initializeApp } from "firebase/app";
import { getDatabase, ref, child } from "firebase/database";

const config = {
  apiKey: process.env.REACT_APP_DATABASE_APIKEY,
  authDomain: process.env.REACT_APP_DATABASE_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_DATABASEURL,
  projectId: process.env.REACT_APP_DATABASE_PROJECTID,
  storageBucket: process.env.REACT_APP_DATABASE_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_DATABASE_MESSAGINGSENDERID,
};

// firebase.initializeApp(config);
const app = initializeApp(config);
const db = getDatabase(app);
const dbRef = ref(db);

const employeePath = (shopId) => "shop_data/" + shopId + "/employee_data/";
const shopPath = (shopId) => "shop_events/" + shopId + "/authorised_id/";
const empRef = (shopId) => child(dbRef, employeePath(shopId));
const shopRef = (shopId) => child(dbRef, shopPath(shopId));
const messRef = (shopId) => child(dbRef, "shop_data/" + shopId + "/message_data/")
// const scheRef = (shopId) => child(dbRef, "shop_schedule" + shopId + "/log_schedule")

/**
* Generate firebase path to get the schedule from one employee
*
* @function logSchRef
* @param {string} shopId - Id of current SPR store.
* @param {string} empId - Id of the employee.
* @return {string} - Path to use on firebase read/write functions.
*/
const logSchRef = (shopId, empId) => child(dbRef, `shop_schedule/${shopId}/authorized_id/${empId}/log_schedules`)

/**
* Generate firebase path to get the working status requirement from one employee
*
* @function statusRef
* @param {string} shopId - Id of current SPR store.
* @param {string} empId - Id of the employee.
* @return {string} - Path to show current overtime status.
*/
const statusRef = (shopId, empId) => child(dbRef, `shop_schedule/${shopId}/authorized_id/${empId}/current_status`)

/**
* Generate firebase path to get the working status requirement from one employee
*
* @function todoRef
* @param {string} shopId - Id of current SPR store.
* @return {string} - Path to show current overtime status.
*/
const todoRef = (shopId) => child(dbRef, `shop_events/${shopId}/todo_data`)

export { dbRef, employeePath, shopPath, empRef, shopRef, messRef, logSchRef, statusRef, todoRef };
