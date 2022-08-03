import { useEffect } from "react";
import { useState } from "react";
import { Button } from "react-bootstrap";

function Extra() {
  return (
    <div className="extra">
      <div className="extra title">{"EXTRA (FUNCTIONALITY TO MAKE SPR DATABASE 2.0"}</div>
      <div>
        <Button>{"Name Changer From Name -> First Name + Last Name"} </Button>
        <Button>{"Add PIN and tons of features"}</Button>
      </div>
    </div>
  );
}

export default Extra;
