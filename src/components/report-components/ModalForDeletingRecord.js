import { Button, Modal } from "react-bootstrap";
import { child, equalTo, orderByChild, query, remove, get } from "firebase/database";
import { shopRef } from "../../js/firebase_init";
import { Trans, useTranslation } from "react-i18next";

function ModalForDeletingRecord(props) {
  const { t } = useTranslation("translation", { keyPrefix: "report" });
  const handleDeleteDayFromModal = () => {
    // onSubmit: If the user really want to delete the record
    let id = props.employeeID;
    let dateStamp = props.dateStamp;
    const qDay = query(child(shopRef(props.shopId), `${id}/log_events/`), orderByChild("dateStamp"), equalTo(dateStamp));
    get(qDay).then((snap) => {
      let val = snap.val();
      console.log(val);
      if (val !== null) {
        Object.keys(val).forEach((key) => {
          console.log(key);
          remove(child(shopRef(props.shopId), `${id}/log_events/${key}`));
        });
      }
    });
    props.onHide();
  };
  return (
    <div>
      <Modal show={props.show} onHide={props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5>
              <Trans i18nKey={"report.Delete Title"}>Delete all records from day {{ date: props.date }}</Trans>
            </h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>
            <Trans i18nKey={"report.Delete Warning"}>
              WARNING: Employee {{name: props.employeeName}} will have their records for day {{date: props.date}} deleted. Do you really want to proceed?
            </Trans>
          </h6>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onHide}>{t("Cancel")}</Button>
          <Button variant="danger" onClick={() => handleDeleteDayFromModal()}>
            {t("Delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ModalForDeletingRecord;
