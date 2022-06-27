import { child, set } from "firebase/database";
import { messRef } from "../js/firebase_init";
import { useFormik } from "formik"
import Session from "react-session-api"
import { get } from "jquery";

function Message () {
    const shopId = Session.get("shop_id");
    const shopChosen = Session.get("shop_chosen");

    const formik = useFormik({
        initialValues: {
            name: '',
            message: ''
        },
        onSubmit: values => {
            addMessage(shopId, values.name, values.message);
            alert(JSON.stringify(values))
        }
    })

    function addMessage(shopId, name, message) {
        let today = getDateData();
        get(messRef(shopId), snap => {
            console.log("Size", snap.size);
            if (snap.size > 4) alert ("Reach maximum message to show on screen. Please delete some of them or change the messages.")
        })
        set(child(messRef(shopId), `${today.documentStamp}`), {
            date: today.dateNow,
            message: message,
            name: name
          });
    }

    const getDateData = () => {
        let date = new Date();
        let year = date.getFullYear();
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let day = ("0" + date.getDate()).slice(-2);
        let hour = ("0" + date.getHours()).slice(-2);
        let minute = ("0" + date.getMinutes()).slice(-2);
        let second = ("0" + date.getSeconds()).slice(-2);
        let milisec = ("" + date.getMilliseconds()).slice(-1);
        let documentStamp = year + month + day + hour + minute + second + milisec;
        let dateNow = `${day}-${month}-${year}`;
    
        let obj = {
          documentStamp: documentStamp + "Mess",
          date: dateNow
        };
        return obj;
    }
    return (
        <div className="message-function">
            <div className="message-editor">
                <div className="message-editor-title">Add message for {shopChosen} Kirppis</div>
                <form onSubmit={formik.handleSubmit} className="form-inline">
                    <label htmlFor="name">Name:</label>
                    <input id="name" name="name" type="text" onChange={formik.handleChange} value={formik.values.name}></input>
                    <label htmlFor="message">Message:</label>
                    <input id="message" name="message" type="text" onChange={formik.handleChange} value={formik.values.message}></input>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    )
}

export default Message