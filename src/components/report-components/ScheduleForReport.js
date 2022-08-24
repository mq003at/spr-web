import { Fragment} from "react";
import { dateHandler2 } from "../../js/tool_function";

function ScheduleForReport(props) {
  const sched = props.sched;
  return (
    <Fragment>
      {!sched ? <div>X</div> : (
        <div title={sched.isOvertime ? "Work overtime" : "Not overtime"}>{dateHandler2(sched.inStamp, "int", ":").shortTime} - {dateHandler2(sched.outStamp, "int", ":").shortTime}</div>
      )}
    </Fragment>
  )
}

export default ScheduleForReport;
