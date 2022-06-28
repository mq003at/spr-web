import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StoreSelectable from "./components/StoreSelectable";
import Management from "./components/Management";
import ErrorPage from "./components/ErrorPage";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { useState } from "react";



function App() {
  return (
      <Router>
        <Header navigation=""></Header>
        <Routes>
          <Route path="/" element={<StoreSelectable />}></Route>
          <Route path="/management" element={<Management />}></Route>
          <Route path="/management/message" element={<Management />}></Route>
          <Route path="/management/report" element={<Management />}></Route>
          <Route path="*" element={<ErrorPage />}></Route>
        </Routes>
        <Footer></Footer>
      </Router>
  );
}

export default App;
