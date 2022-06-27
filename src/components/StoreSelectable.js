import "../css/StoreSelectable.css";
import { dbRef } from "../js/firebase_init";
import { child, get } from "firebase/database";
import { useEffect, useState } from "react";
import $ from "jquery";
import { useNavigate } from "react-router-dom";
import { Formik, useFormik } from "formik";
import Session from 'react-session-api';

function StoreSelectable() {
  let navigate = useNavigate();
  const [count, setCount] = useState([]);

  const getStore = () => {
    get(child(dbRef, "shop_data")).then((snap) => {
      let val = snap.val();
      Object.keys(val).forEach((key) => {
        setCount((count) => [...count, [key, val[key].name, val[key].pin, val[key].pinUser]]);
      });
    });
  };

  const goToStore = () => {
    let shopChosen = $("input[type=radio][name=place]:checked").val();
    if (!$("input#pinInput").val()) alert("Input your PIN code to proceed.");
    else {
      if (typeof shopChosen == "undefined") alert("Please choose the store.");
      else {
        let pinInput = $("input#pinInput").val();
        switch (pinInput) {
          case count[shopChosen][2]:
            //Employer Pin
            Session.set("user", "employer");
            Session.set("shop_chosen", count[shopChosen][1]);
            Session.set("shop_id", count[shopChosen][0]);
            navigate("/management");
            break;
          case count[shopChosen][3]:
            //Employee Pin
            Session.set("user", "employee");
            Session.set("shop_chosen", count[shopChosen][0]);
            Session.set("shop_id", count[shopChosen][0]);
            navigate("/management");
            break;
          default:
            // Wrong pin
            alert("Wrong PIN.");
            break;
        }
      }
    }
  };

  useEffect(() => {
    if (Session.get("user") == null) getStore();
    else {
      navigate("/management");
    }
  }, []);

  return (
    <div className="Store-Selectable">
      <h2 id="store-intro">Myymälä</h2>
      <table id="place_option" align="center" style={{ tableLayout: "fixed" }} className="radioButtons collapseBorder">
        
        <tbody id="store-table">
          {count.map((data, index) => (
            <tr key={"place" + index.toString()}>
              <td>
                <label id={data[0]}>{data[1]}</label>
              </td>
              <td className="store-check">
                <input type="radio" name="place" value={index}></input>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ui labeled input" align="center">
        <div className="ui label" align="center">
          PIN
        </div>
        <input id="pinInput" type="text" placeholder="PIN"></input>
        <button type="button" className="button" id="place_confirm" onClick={() => goToStore()}>
          Go
        </button>
      </div>
    </div>
  );
}

export default StoreSelectable;
