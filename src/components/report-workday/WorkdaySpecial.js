import { Fragment, useState } from "react";
import * as FaIcons from "react-icons/fa";
import ModalForDayStatus from "./ModalForDayStatus";

function WorkdaySpecial(props) {
  const [showModalForDayStatus, setShowModalForDayStatus] = useState(false);

  let statusArr = props.statusArr;
  let status = "Present";
  let isWorkday = true;
  if (statusArr && statusArr.schedules.length > 0) {
    status = statusArr.schedules[0].special_status !== undefined ? statusArr.schedules[0].special_status : "Present";
    isWorkday = statusArr.schedules[0].isWorkday !== undefined ? statusArr.schedules[0].isWorkday : "true";
  }

  return (
    <div className="report table-section time-stamp-cell">
      <Fragment>
        {showModalForDayStatus && (
          <ModalForDayStatus
            show={showModalForDayStatus}
            onHide={() => {
              setShowModalForDayStatus(false);
            }}
            {...props}
            status={status}
            isWorkday={isWorkday}
          />
        )}
      </Fragment>
      <label onClick={() => setShowModalForDayStatus(true)} key={"report-workday-status"} title={props.status}>
        {status !== "Present" ? status : <FaIcons.FaPlus />}
      </label>
    </div>
  );
}

export default WorkdaySpecial;
