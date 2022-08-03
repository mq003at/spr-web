import { Button, Modal } from "react-bootstrap";
import { child, equalTo, orderByChild, query, remove, get, set } from "firebase/database";
import { shopRef } from "../../js/firebase_init";

function ModalForDeletingRecord(props) {
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
            <h5>Delete all records from day {props.date}</h5>{" "}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>
            WARNING: Employee {props.employeeName} will have their records for day {props.date} deleted. Do you really want to proceed?
          </h6>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDeleteDayFromModal()}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ModalForDeletingRecord;
