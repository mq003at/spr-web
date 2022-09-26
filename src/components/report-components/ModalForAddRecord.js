import { child, set } from "firebase/database";
import { shopRef } from "../../js/firebase_init";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

// Adding records
function ModalForAddRecord(props) {
  const [addRecordStatus, setAddRecordStatus] = useState("");
  const { t } = useTranslation("translation", {keyPrefix: "report"})
  // Formik
  const formik = useFormik({
    initialValues: {
      inStamp: "",
      outStamp: "",
    },
    onSubmit: (values) => {
      handleAddRecord(values.inStamp, values.outStamp);
    },
  });

  const handleAddRecord = (inStamp, outStamp) => {
    const validTime = new RegExp("^(?:((2[0-3]|[0-1][0-9])([0-5][0-9])([0-5][0-9]))|)$");

    if (!validTime.test(inStamp) || !validTime.test(outStamp)) setAddRecordStatus(t("Wrong format. Please double-check the time."));
    else {
      handleTimeStamp("in", inStamp);
      handleTimeStamp("out", outStamp);
    }
  };

  // handleTimeStamp
  function handleTimeStamp(direction, time) {
    if (time && time.trim() !== "") {
      let dateStamp = props.dateStamp;
      let timeStamp = dateStamp + time;

      set(child(shopRef(props.shopId), `${props.empId}/log_events/${timeStamp + props.empId}`), {
        dateStamp: dateStamp,
        direction: direction,
        timeStamp: timeStamp,
      });
    }

    formik.resetForm();
    cancelAddRecord();
  }

  const cancelAddRecord = () => {
    props.onHide();
    setAddRecordStatus("");
  }


  return (
    <div className="modal-for-add-record">
      <Modal show={props.show} onHide={() => cancelAddRecord()}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5>{t("Add records for") + " " +  props.dateStr} </h5>{" "}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Body>
            <h6>{t("Input timestamp. You can leave one field blank if you just want to add only one log timestamp.")}</h6>
            <table className="add-record table" align={"center"}>
              <tbody>
                <tr>
                  <th className="add-record table-head">{t("Login:")}</th>
                  <th className="add-record table-head">{t("Logout:")}</th>
                </tr>
              </tbody>

              <tbody>
                <tr>
                  <td>
                    <input id="inStamp" name="inStamp" type="text" onChange={formik.handleChange} value={formik.values.inStamp} placeholder="00:00:00"></input>
                    <div>
                      <small id="stampHelpBlock" className="form-text text-muted">
                        {t("Time Format: HHMMSS")}
                      </small>
                    </div>
                  </td>
                  <td>
                    <input id="outStamp" name="outStamp" type="text" onChange={formik.handleChange} value={formik.values.outStamp} placeholder="23:59:59"></input>
                    <div>
                      {" "}
                      <small id="stampHelpBlock" className="form-text text-muted">
                        {t("Time Format: HHMMSS")}
                      </small>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            {addRecordStatus !== "" && <div className="invalid-feedback d-block">{addRecordStatus}</div>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => cancelAddRecord()}>{t("Cancel")}</Button>
            <Button type="submit" id="record-submit">
              {t("Submit")}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}

export default ModalForAddRecord;
