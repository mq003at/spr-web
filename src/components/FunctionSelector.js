import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/FunctionSelector.css";
import MessageModalForEmployee from "./message-components/MessageModalForEmployee";
import MessageModalForEmployer from "./message-components/MessageModalForEmployer";
import { equalTo, onValue, orderByChild, query } from "firebase/database";
import { todoRef } from "../js/firebase_init";
import { useTranslation } from "react-i18next";

function FunctionSelector(props) {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {keyPrefix: "management"});
  const user = props.user;
  const [addMessShow, setAddMessShow] = useState(false);
  const [badgeNum, setBadgeNum] = useState(0);

  useEffect(() => {
    const qTodo = query(todoRef(props.shopId), orderByChild("check"), equalTo(false));
    return onValue(qTodo, (snap) => setBadgeNum(snap.size));
  }, [props.shopId]);

  return (
    <div className="function-selector">
      {user === "manager" ? (
        <div className="button-wrap">
          <Button title={t("Send a message to employees or to Todo List")} onClick={() => setAddMessShow(true)}>{t("Message")}</Button>
          <Button title={t("See employee's login and logout time.")} onClick={() => navigate("./report")}>
            {t("Report")}
          </Button>
          <Button title={t("Calculate employees' number of workdays.")} onClick={() => navigate("./workday")}>
            {t("Workday Report")}
          </Button>
          <Button title={t("Employee's work schedule")} onClick={() => navigate("./schedule")}>
            {t("Schedule")}
          </Button>
          <Button className="todo-button" title={t("List of messages received from other workers")} onClick={() => navigate("./todo")}>
            <span>{t("Todo List")}</span>
            <span className="badge">{badgeNum}</span>
          </Button>
          <Button title={t("Add more people to the shop, or change their group, etc.")} onClick={() => navigate("./employees")}>
            {t("Employee Management")}
          </Button>
          {/* <Button title="Need help on something? Go here." onClick={() => navigate("./help")}>Help!</Button> */}
          {addMessShow && <MessageModalForEmployer show={addMessShow} onHide={() => setAddMessShow(false)} />}
        </div>
      ) : (
        <div className="button-wrap">
          <Button onClick={() => setAddMessShow(true)}>{t("Message")}</Button>
          <Button title={t("Employee's work schedule")} onClick={() => navigate("./schedule")}>
            {t("Schedule")}
          </Button>
          {addMessShow && <MessageModalForEmployee show={addMessShow} onHide={() => setAddMessShow(false)} />}
        </div>
      )}
    </div>
  );
}

export default FunctionSelector;
