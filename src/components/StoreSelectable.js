import "../css/StoreSelectable.css";
import { dbRef } from "../js/firebase_init";
import { child, get, set } from "firebase/database";
import { createRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { Button } from "react-bootstrap";

function StoreSelectable() {
  let navigate = useNavigate();
  const [count, setCount] = useState([]);
  const inputPinRef = createRef();
  const shopId = sessionStorage.getItem("shopId");

  const formik = useFormik({
    initialValues: {
      pinInput: "",
      place: "",
    },
    onSubmit: (values) => {
      if (values.pinInput === "") alert("Input your PIN code to proceed.");
      else if (values.place === "") alert("Please choose the store.");
      else {
        let pinInput = values.pinInput;
        let shopChosen = values.place;
        switch (pinInput) {
          case count[shopChosen][2]:
            //Manager Pin
            sessionStorage.setItem("shop_id", count[shopChosen][0]);
            sessionStorage.setItem("shop_user", "manager");
            sessionStorage.setItem("shop_chosen", count[shopChosen][1]);
            navigate("/management");
            break;
          case count[shopChosen][3]:
            //Employee Pin
            sessionStorage.setItem("shop_id", count[shopChosen][0]);
            sessionStorage.setItem("shop_user", "manager");
            sessionStorage.setItem("shop_chosen", count[shopChosen][1]);
            navigate("/management");
            break;
          default:
            // Wrong pin
            alert("Wrong PIN.");
            break;
        }
      }
    },
  });

  const getStore = () => {
    get(child(dbRef, "shop_data")).then((snap) => {
      let val = snap.val();
      Object.keys(val).forEach((key) => {
        setCount((count) => [...count, [key, val[key].name, val[key].pin, val[key].pinUser]]);
      });
    });
  };

  useEffect(() => {
    if (!shopId) {
      getStore();
      inputPinRef.current.focus();
    } else {
      navigate("/management");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  return (
    
      <div className="Store-Selectable">
        <h2 id="store-intro">Myymälä</h2>
        <form onSubmit={formik.handleSubmit}>
          <table id="place_option" align="center" className="radioButtons collapseBorder">
            <tbody id="store-table">
              {count.map((data, index) => (
                <tr key={"place" + index.toString()}>
                  <td>
                    <label id={data[0]}>{data[1]}</label>
                  </td>
                  <td className="store-check">
                    <input type="radio" name="place" value={index} onChange={() => (formik.values.place = index)}></input>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ui labeled input" align="center">
            <div className="ui label" align="center">
              PIN
            </div>
            <input id="pinInput" name="pinInput" type="password" onChange={formik.handleChange} value={formik.values.pinInput} placeholder="PIN" ref={inputPinRef}></input>
            <button type="submit" className="button" id="place_confirm">
              Go
            </button>
          </div>
        </form>

      </div>
  );
}

export default StoreSelectable;
