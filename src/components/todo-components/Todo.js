import { child, onValue, remove, update } from "firebase/database";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { todoRef } from "../../js/firebase_init";
import { FaTrashAlt } from "react-icons/fa";
import "../../css/Todo.css";
import { useTranslation } from "react-i18next";
import useWindowDimensions from "../extra/WindowDimension";

function Todo() {
  const shopId = sessionStorage.getItem("shop_id");
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const [todoList, setTodoList] = useState([]);
  const [baseTodoList, setBaseTodoList] = useState([]);
  const [isSortByDate, setIsSortByDate] = useState(true);
  const [isSortByRecipient, setIsSortByRecipient] = useState(false);
  const [isSortByComplete, setIsSortByComplete] = useState(false);
  const [isSortBySender, setIsSortBySender] = useState(false);

  // Change complete status
  const changeTodo = (key, newStatus) => {
    update(child(todoRef(shopId), key), {
      check: newStatus,
    });
  };

  // Delete todo
  const deleteTodo = (key) => {
    remove(child(todoRef(shopId), key));
  };

  useEffect(() => {
    return onValue(todoRef(shopId), (snap) => {
      let val = snap.val();
      let temp = [];
      if (val) {
        Object.keys(val).forEach((key) => {
          temp.push({
            name: val[key].name,
            recipient: val[key].recipient,
            date: val[key].date,
            message: val[key].message,
            check: val[key].check,
            key: key,
            from_employee: val[key].from_employee
          });
        });
        setTodoList(temp.map((x) => x));
        setBaseTodoList(temp.map((x) => x));
      } else setTodoList([]);
    });
  }, [shopId]);

  // Sorting method
  useEffect(() => {
    if (baseTodoList.length > 0) {
      let temp = [...baseTodoList];
      if (isSortBySender) {
        temp.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      }

      if (isSortByRecipient) {
        temp.sort((a, b) => {
          return a.recipient.localeCompare(b.recipient);
        });
      }

      if (isSortByDate) {
        temp.sort((a, b) => {
          let dateA = new Date(a.date).getTime();
          let dateB = new Date(b.date).getTime();
          if (dateA < dateB) return -1;
          else return 1;
        });
      }

      if (isSortByComplete) {
        console.log("reach", temp)
        temp.sort((a, b) => {
          return Number(b.check) - Number(a.check);
        });
        console.log("after", temp)
      }
      setTodoList(() => temp.map((x) => x));
    }
  }, [isSortByComplete, isSortByDate, isSortByRecipient, isSortBySender, baseTodoList]);

  const todoClassName = (todo) => {
    if (todo) {
      let className = "";
      if (todo.check) className += "del ";
      if (todo.from_employee) className += "darkblue "
      return className;
    } else return ""
  }

  function clickTodo (todo) {
    if (width < 455) {
      changeTodo(todo.key, !todo.check)
    }
  }

  return (
    <div className="todo">
      <div className="todo title">{t("todo.TODO LIST")}</div>
      <hr></hr>
      <div className="todo showcase-section">
        <Table className="todo showcase" id="todo-table">
          <thead>
            <tr>
              <th scope="col" className={"todo date cursor-pointer " + isSortByDate} onClick={() => setIsSortByDate(!isSortByDate)}>
                {t("todo.Date")}
              </th>
              <th scope="col" className={"todo sender cursor-pointer " + isSortBySender} onClick={() => setIsSortBySender(!isSortBySender)}>
                {" "}
                {t("todo.Sender")}
              </th>
              <th scope="col" className={"todo rec cursor-pointer " + isSortByRecipient} onClick={() => setIsSortByRecipient(!isSortByRecipient)}>
                {t("todo.Recipient")}
              </th>
              <th scope="col" className={"todo mess"}> {t("todo.Message")}</th>
              <th scope="col" className={"todo complete cursor-pointer " + isSortByComplete} onClick={() => setIsSortByComplete(!isSortByComplete)}>
                {" "}
                {t("todo.Complete?")}
              </th>
              <th scope="col" className={"todo delete cursor-pointer"}> {t("todo.Delete")}</th>
            </tr>
          </thead>
          <tbody>
            {todoList.length > 0 ? (
              todoList.map((todo, index) => (
                <tr key={"todo-" + index} className={todoClassName(todo)} onClick={() => clickTodo(todo)} >
                  <td className="todo date">{todo.date}</td>
                  <td className="todo sender">{todo.name}</td>
                  <td className="todo rec">{todo.recipient}</td>
                  <td className="todo mess">{todo.message}</td>
                  <td className="todo complete">
                    <input type="checkbox" checked={todo.check} onChange={() => changeTodo(todo.key, !todo.check)}></input>
                  </td>
                  <td className={"todo delete cursor-pointer"} onClick={() => deleteTodo(todo.key)}>
                    <div>
                      <FaTrashAlt />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>
                  <div className="text-center"> {t("todo.Nothing in here.")}</div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default Todo;
