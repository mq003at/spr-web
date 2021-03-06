import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { dateHandler2, nameHandler } from "../../js/tool_function";
import { addSchedule, findId } from "../../js/firebase_functions";

function ScheduleUpload(props) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusText, setStatusText] = useState("Placeholder");

  const uploadErr = useRef(null);

  function onFileUpload() {
    if (!selectedFile) setStatusText("Please put the file in the box");
    else if (selectedFile.name > 5000000) setStatusText("File size is too large.");
    else if (!(selectedFile.name.split(".").pop() === "csv")) setStatusText("This is not a .csv file.");
    else {
      let fileString = [];
      const reader = new FileReader();
      reader.readAsText(selectedFile, "ISO-8859-1");
      reader.onload = (e) => {
        fileString = e.target.result.split("\n");
        fileString.shift();
        if (fileString[0].split(";").length !== 4) setStatusText("Error! Only receive 4 column: Date, Name, Login, Logout.");
        else {
          fileString.forEach((arr, index) => {
            if (arr) {
              let data = arr.split(";");
              let dateStamp = dateHandler2(data[0], "DMY-int", ".");
              let employeeName = nameHandler(data[1], "fullname");
              let inStamp = data[2].replace(":", "");
              let outStamp = data[3].replace("\r", "").replace(":", "");
              if (inStamp.length === 3) inStamp = "0" + inStamp;
              if (outStamp.length === 3) outStamp = "0" + inStamp;
              inStamp = dateStamp + inStamp;
              outStamp = dateStamp + outStamp;
              addScheduleStamp(dateStamp, employeeName, inStamp, outStamp);
            }
          });
          if (uploadErr.current) setStatusText(uploadErr.current);
          else {
            setStatusText("File uploaded. You may close this upload pop-up now.");
            setTimeout(props.onHide, 5000);
          }
        }
      };
    }
  }

  function addScheduleStamp(dateStamp, employeeName, inStamp, outStamp) {
    let id = findId(employeeName);
    let result = addSchedule(id, dateStamp, inStamp + "00", outStamp + "00");
    if (result) uploadErr.current = result;
  }

  useEffect(() => {}, []);

  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Upload Schedule into SPR-Kirppis.</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Put the CSV file containing schedule of all employees into the box below. The file muse only have four criteria: Date, Name, Scheduled Login and Scheduled Logout.</p>
        <p>Uploading the same schedule will overwrite the old ones in the database.</p>
        <div className="input-group">
          <input type="file" className="form-control" id="selectedFile" accept=".csv" onChange={(e) => setSelectedFile(e.target.files[0])} />
          <button className="input-group-text" onClick={() => onFileUpload()}>
            Upload
          </button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="modal-status-text">{statusText}</div>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ScheduleUpload;
