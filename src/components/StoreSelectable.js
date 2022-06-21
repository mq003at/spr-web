import "../css/StoreSelectable.css";
import { dbRef } from "../js/firebase_init";
import { getDatabase, ref, child, get } from "firebase/database";
import { useEffect, useState } from "react";
import $ from "jquery";
import { useNavigate, useParams } from "react-router-dom";

function StoreSelectable() {
  //   const pin = {
  //     TestiKirppis: ["Jarii1", "spr1234", "6899bc73da4ace09"],
  //     Vaasa: ["D0ED5D57F47580F2", "spr9876", "Vas183"],
  //     Seinäjoki: ["a1a1a1a1a1a1a1a1", "spr9999", "Seina19"],
  //     Kokkola: ["regT863", "spr0000", "b4b8bb4ceeaa2aee"],
  //   };
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
            sessionStorage.setItem("user", "employer");
            sessionStorage.setItem("shop_chosen", count[shopChosen][1]);
            sessionStorage.setItem("shop_id", count[shopChosen][0]);
            navigate("/management", {
              state: {
                user: "employer",
                shopChosen: count[shopChosen][1],
                shopId: count[shopChosen][0]
              }
            });
            break;
          case count[shopChosen][3]:
            //Employee Pin
            sessionStorage.setItem("user", "employee");
            sessionStorage.setItem("shop_chosen", count[shopChosen][0]);
            sessionStorage.setItem("shop_id", count[shopChosen][0]);
            navigate("/management", {
              state: {
                user: "employee",
                shopChosen: count[shopChosen][1],
                shopId: count[shopChosen][0]
              }
            });
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
    if (sessionStorage.getItem("user") == null) getStore();
    else {
      navigate("/management", {
        state: {
          user: sessionStorage.getItem("user"),
          shopChosen: sessionStorage.getItem("shop_chosen"),
          shopId: sessionStorage.getItem("shop_id")
        }
      });
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
