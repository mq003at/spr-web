import { Button, Modal } from "react-bootstrap";
import { child, update } from "firebase/database";
import { useFormik } from "formik";
import { logSchRef } from "../../js/firebase_init";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";

function ModalForDayStatus(props) {
  const dateStr = props.date.toLocaleDateString("FI-fi");
  const [check, onCheck] = useState(props.isWorkday);
  const { t } = useTranslation('translation', { keyPrefix: 'report-workday' });
  const formik = useFormik({
    initialValues: {
      status: "",
    },
    onSubmit: (values) => {
      handleDayStatus(values.status);
    },
  });
  const handleDayStatus = (status) => {
    // onSubmit: If the user want to change the Status
    update(child(logSchRef(props.shopId, props.empId), props.dateStamp + props.empId + "Sch"), {
      special_status: status,
      isWorkday: check,
    });
    props.onHide();
  };
  return (
    <div>
      <Modal show={props.show} onHide={props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5>
              <Trans i18nKey="report-workday.Status day" dateStr={dateStr}>
                Add status for day {{ dateStr }}
              </Trans>
            </h5>
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Body>
            <div>
              <h6>
                <Trans i18nKey={"report-workday.Current"}>
                  Employee: {{name: props.empName}}. Date: {{dateStr: dateStr}}. Current status: {t(props.status)}.
                </Trans>
              </h6>
              <p>{t("Enter this employee's new status in the field below. If this day is still considered as work day although they do not show up, check the box below.")}</p>
              <input className="text-center" id="status" name="status" type="text" onChange={formik.handleChange} value={formik.values.status} placeholder={t(props.status)}></input>
              <br></br> <br></br>
              <label>
                <label>
                  <input type="checkbox" checked={check} onChange={() => onCheck(!check)} />
                  {t("This person still receive workday.")}
                </label>
              </label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={props.onHide}>{t("Cancel")}</Button>
            <Button variant="danger" type="submit">
              {t("Submit")}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}

export default ModalForDayStatus;
