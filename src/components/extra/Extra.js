import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";

function Extra() {
  const [apiRes, setApiRes] = useState("");


  useEffect(() => {
    function callApi () {
      fetch("http://localhost:8000/testApi")
        .then(res => res.text())
        .then(res => setApiRes(res))
    }
    callApi();
  }, []);

  return (
    <div className="extra">
      <div className="extra title">EXTRA</div>
      <p className="App-intro">{apiRes}</p>

      
    </div>
  );
}

export default Extra;
