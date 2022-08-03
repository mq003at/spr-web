import { Button, Modal } from "react-bootstrap";
import { useFormik } from "formik";
import { child, set } from "firebase/database";
import { messRef } from "../../js/firebase_init";
import { getDateData } from "../../js/tool_function";

function MessageModalForEmployee(props) {
  const shopId = props.shopId;

  const formik = useFormik({
    initialValues: {
      name: "",
      message: "",
    },
    onSubmit: (values) => {
      addMessage(shopId, values.name, values.message);
    },
  });

  function addMessage(shopId, name, message) {
    let today = getDateData();
    set(child(messRef(shopId), `${today.documentStamp}`), {
      date: today.date,
      message: message,
      name: name,
    });
  }
  return (
    <Modal className="inv" {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Send messages</Modal.Title>
      </Modal.Header>
      <form onSubmit={formik.handleSubmit} className="form-inline">
        <Modal.Body>
          <p>Fill in this form to contact the manager. Please note that this is used to remind them for something, like changing your schedules. You have to call them or send them emails if you have urgent matters.</p>

          <div class="form-outline mb-4">
            <input type="text" id="message-form-name" class="form-control" placeholder="Name (i.e. Tiina)" />
          </div>

          <div class="form-outline mb-4">
            <input type="text" id="message-form-to" class="form-control" placeholder="Send to... (i.e. Tiina)" />
          </div>

          <div class="form-outline mb-4">
            <textarea class="form-control" id="form4Example3" rows="4" placeholder="Message (i.e. Please clean the store tomorrow)"></textarea>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
          <Button>Send</Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default MessageModalForEmployee;
