import { Modal, Button, CloseButton } from "react-bootstrap";
import { Fragment, useCallback, useEffect, useState } from "react";
import { dateHandler } from "../../js/tool_function";
import ReportByDate from "./ReportByDate";
import { child, equalTo, orderByChild, query, remove, get, set } from "firebase/database";
import { shopRef } from "../../js/firebase_init";
import { useFormik } from "formik";
import * as FaIcons from "react-icons/fa";

function ReportByPerson(props) {
  const shopId = sessionStorage.getItem("shop_id");
  const startDate = props.startDate;
  const endDate = props.endDate;
  const employeeID = props.employeeID;
  const employeeName = props.employeeName;

  const [dateRange, setDateRange] = useState([]);
  const [totalHour, setTotalHour] = useState(parseInt(0));
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddRecordToDayModal, setAddRecordToDayModal] = useState(false);
  const [dataForModal, setDataForModal] = useState([]);
  const [addRecordStatus, setAddRecordStatus] = useState("");

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

  // Calculate total hour
  const addHour = useCallback(
    (hour) => {
      setTotalHour((totalHour) => totalHour + hour);
    },
    [setTotalHour]
  );

  // Generate array from startDate to endDate
  useEffect(() => {
    let tempArr = [];
    const start = new Date(startDate.getTime());
    const end = new Date(endDate.getTime());
    let loop = new Date(start);
    tempArr.push(start);

    while (loop < end) {
      tempArr.push(loop);
      const newDate = loop.setDate(loop.getDate() + 1);
      loop = new Date(newDate);
    }

    setDateRange(tempArr.map((x) => x));
  }, [startDate, endDate]);

  // Modal's function to delete the records
  function modalFunction(id, dateStamp, date) {
    setDataForModal([id, dateStamp, date]);
    setShowDayModal(true);
  }
  function addRecordForThisDay(date) {
    setDataForModal([employeeID, date]);
    setAddRecordToDayModal(true);
  }

  // onSubmit: If the user really want to delete the record
  function handleDeleteDayFromModal() {
    let id = dataForModal[0];
    let dateStamp = dataForModal[1];
    const qDay = query(child(shopRef(shopId), `${id}/log_events/`), orderByChild("dateStamp"), equalTo(dateStamp));
    get(qDay).then((snap) => {
      let val = snap.val();
      console.log(val);
      if (val !== null) {
        Object.keys(val).forEach((key) => {
          console.log(key);
          remove(child(shopRef(shopId), `${id}/log_events/${key}`));
        });
      }
    });
    setDataForModal([]);
    setShowDayModal(false);
  }

  // onSubmit: adding more record to specific day
  function handleAddRecord(inStamp, outStamp) {
    const validTime = new RegExp("^(((([0-1][0-9])|(2[0-3])):?[0-5][0-9]:?[0-5][0-9]+$))");

    if (inStamp === "" && outStamp === "") {
      setAddRecordStatus("You cannot leave both input empty.");
    } else if (inStamp !== "" && !validTime.test(inStamp)) {
      setAddRecordStatus("The time you put in login box is invalid!");
    } else if (outStamp !== "" && !validTime.test(outStamp)) {
      setAddRecordStatus("The time you put in logout box is invalid!");
    } else {
      if (validTime.test(inStamp)) {
        console.log(dataForModal[1], "P");
        let time = inStamp.replace(":", "");
        let dateStamp = dateHandler(dataForModal[1]).dateStamp;
        let timeStamp = dateStamp + time;
        let direction = "in";

        set(child(shopRef(shopId), `${employeeID}/log_events/${timeStamp + employeeID}`), {
          dateStamp: dateStamp,
          direction: direction,
          timeStamp: timeStamp,
        });

        setAddRecordToDayModal(false);
        setAddRecordStatus("");
        if (validTime.test(outStamp)) {
          let time = outStamp.replace(":", "");
          let dateStamp = dateHandler(dataForModal[1]).dateStamp;
          let timeStamp = dateStamp + time;
          let direction = "out";

          set(child(shopRef(shopId), `${employeeID}/log_events/${timeStamp + employeeID}`), {
            dateStamp: dateStamp,
            direction: direction,
            timeStamp: timeStamp,
          });

          setAddRecordToDayModal(false);
          setAddRecordStatus("");
        }
      }
    }
  }

  // onCancelAddRecord
  function cancelAddRecord() {
    setAddRecordToDayModal(false);
    setAddRecordStatus("");
  }

  return (
    <Fragment>
      {dateRange.length > 0 &&
        dateRange.map((date, index) => (
          <tr key={"report-" + dateHandler(date).timeStamp} className="report table-section table-row">
            <td className="report table-section add-record-cell" width={"0.5%"} data-exclude={"true"}>
              <span className="report table-section date-cell add-record-part" onClick={() => addRecordForThisDay(date)}>
                <FaIcons.FaPlus title={"Click to add extra record for day " + date.toLocaleDateString("FI-fi")} />
              </span>
            </td>
            <td className="report table-section date-cell" width={"10.5%"}>
              <span className="report table-section date-cell date-part" onClick={() => modalFunction(employeeID, dateHandler(date).dateStamp, date.toLocaleDateString("FI-fi"))} title="Click to delete all records for this day">
                {date.toLocaleDateString("fi-FI")}
              </span>
            </td>
            <td className="report table-section time-stamp-cell">
              <ReportByDate shopId={shopId} date={date} employeeID={employeeID} addHour={addHour} />
            </td>
          </tr>
        ))}
      <tr className="report table-section table-row">
        <td display={"none"} data-exclude={"true"}></td>
        <td className="report table-section total-cell">
          <span title="Calculate total working hours of this employee">Total</span>
        </td>
        <td className="report table-section time-stamp-cell">{totalHour ? <span>{Math.round(totalHour * 100) / 100} hours.</span> : <span>0 hour.</span>}</td>
      </tr>
      <tr className="empty">
        <td>
          <div>
            <Modal show={showDayModal} onHide={() => setShowDayModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>
                  <h5>Delete all records from day {dataForModal[2]}</h5>{" "}                 
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <h6>
                  WARNING: Employee {employeeName} will have their records for day {dataForModal[2]} deleted. Do you really want to proceed?
                </h6>
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={() => setShowDayModal(false)}>Cancel</Button>
                <Button onClick={() => handleDeleteDayFromModal()}>Delete</Button>
              </Modal.Footer>
            </Modal>
            <Modal show={showAddRecordToDayModal} onHide={() => setAddRecordToDayModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>
                  <h5>Add records for {employeeName}</h5>{" "}
                </Modal.Title>
              </Modal.Header>
              <form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                  <h6>Input timestamp. You can leave one field blank if you just want to add only one log timestamp.</h6>
                  <table className="add-record table" align={"center"}>
                    <tbody>
                      <tr>
                        <th className="add-record table-head">Login:</th>
                        <th className="add-record table-head">Logout:</th>
                      </tr>
                    </tbody>

                    <tbody>
                      <tr>
                        <td>
                          <input id="inStamp" name="inStamp" type="text" onChange={formik.handleChange} value={formik.values.inStamp} placeholder="00:00:00"></input>
                          <div>
                            <small id="stampHelpBlock" className="form-text text-muted">
                              Date Format: HH:MM:SS
                            </small>
                          </div>
                        </td>
                        <td>
                          <input id="outStamp" name="outStamp" type="text" onChange={formik.handleChange} value={formik.values.outStamp} placeholder="23:59:59"></input>
                          <div>
                            {" "}
                            <small id="stampHelpBlock" className="form-text text-muted">
                              Date Format: HH:MM:SS
                            </small>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {addRecordStatus !== "" && <div className="invalid-feedback d-block">{addRecordStatus}</div>}
                </Modal.Body>
                <Modal.Footer>
                  <Button type="submit" id="record-submit">
                    Submit
                  </Button>
                  <Button onClick={() => cancelAddRecord()}>Cancel</Button>
                </Modal.Footer>
              </form>
            </Modal>
          </div>
        </td>
      </tr>

      {/* Bootstrap modal functionality */}
    </Fragment>
  );
}

export default ReportByPerson;
