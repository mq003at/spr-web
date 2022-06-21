import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get  } from "firebase/database";

const config = {
	// apiKey: "AIzaSyCUF2pi4jedNu1nDLXeTsTHZe_j04Igyf4",
	// authDomain: "spr-kirppis-tas.firebaseapp.com",
	// databaseURL: "https://spr-kirppis-tas.firebaseio.com",
	// projectId: "spr-kirppis-tas",
	// storageBucket: "spr-kirppis-tas.appspot.com",
	// messagingSenderId: "718150448205"

	apiKey: "AIzaSyBBBDUPxVGYNMX9DsKNeO1Qtdpr6k3L6q4",
	authDomain: "spr-kirppis-154eb.firebaseapp.com",
	databaseURL: "https://spr-kirppis-154eb-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "spr-kirppis-154eb",
	storageBucket: "spr-kirppis-154eb.appspot.com",
	messagingSenderId: "675286720011",
	appId: "1:675286720011:web:4c9a96eee04bca32c4310e"
};

// firebase.initializeApp(config);
const app = initializeApp(config);
const db = getDatabase(app);
const dbRef = (ref(db));
// get(child(dbRef, "shop_data")).then((snap) => {
// 	if(snap.exists) console.log(snap.val());
// 	else console.log("No data");
// })

const employeePath = (shopId) => "shop_data/" + shopId + "/employee_data/";
const shopPath = (shopId) => "shop_events/" + shopId + "/authorised_id/";
const empRef = (shopId) => child(dbRef, employeePath(shopId))
const shopRef = (shopId) => child(dbRef, shopPath(shopId))
export {dbRef, employeePath, shopPath, empRef, shopRef};