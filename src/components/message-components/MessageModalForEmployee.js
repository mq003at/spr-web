import { Button, Modal } from "react-bootstrap";
import { useFormik } from "formik";
import { child, set } from "firebase/database";
import { todoRef } from "../../js/firebase_init";
import { getDateData } from "../../js/tool_function";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function MessageModalForEmployee(props) {
  const shopId = sessionStorage.getItem("shop_id");
  const [status, setStatus] = useState("");
  const {t} = useTranslation("translation", {keyPrefix: "management"});

  const formik = useFormik({
    initialValues: {
      name: "",
      message: "",
      recipient: "",
    },
    onSubmit: (values) => {
      addTodo(values.name, values.message, values.recipient);
    },
  });

  function addTodo(name, message, rec) {
    if (name !== "" && message !== "" && rec !== "") {
      let today = getDateData();
      console.log(name, message, today.documentStamp, today.dateStamp, rec, shopId)
      set(child(todoRef(shopId), today.documentStamp + "Todo") , {
        name: name,
        message: message,
        recipient: rec,
        date: today.date,
        dateStamp: today.dateStamp,
        check: false,
        from_employee: true
      })
      props.onHide();
    } else {
      setStatus(`${t("Do not leave any empty fields.")}`);
    }
  }

  return (
    <Modal className="inv" show={props.show} onHide={props.onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{t("Send messages")}</Modal.Title>
      </Modal.Header>
      <form onSubmit={formik.handleSubmit} className="form-inline">
        <Modal.Body>
          <p>{t("Send the message so that every employees can see when they check their schedule. Also, you can check the box below to send the message to all the managers instead.")}</p>

          <div className="form-outline mb-4">
            <input type="text" id="name" name="name" className="form-control" onChange={formik.handleChange} value={formik.values.name} placeholder={t("Name (i.e. Tiina)")} />
          </div>

          <div className={"form-outline mb-4"}>
            <input type="text" id="recipient" name="recipient" className="form-control" onChange={formik.handleChange} value={formik.values.recipient} placeholder={t("Send to... (i.e. Tiina)")} />
          </div>

          <div className="form-outline mb-4">
            <textarea className="form-control" id="message" name="message" rows="4" onChange={formik.handleChange} value={formik.values.message} placeholder={t("Message (i.e. Please clean the store tomorrow)")}></textarea>
          </div>

          <div className="text-danger d-inline mb-4">
            <small>{status}</small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onHide}>{t("Close")}</Button>
          <Button type="submit">{t("Send")}</Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default MessageModalForEmployee;
