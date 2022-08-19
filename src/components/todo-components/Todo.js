import { child, onValue, remove, update } from "firebase/database";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { todoRef } from "../../js/firebase_init";
import { FaTrashAlt } from "react-icons/fa";
import "../../css/Todo.css";
import { useTranslation } from "react-i18next";

function Todo(props) {
  const shopId = sessionStorage.getItem("shop_id");
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
          });
        });
        setTodoList(temp.map((x) => x));
        setBaseTodoList(temp.map((x) => x));
      } else setTodoList([])
    });
  }, [shopId]);

  // Sorting method
  useEffect(() => {
    if (baseTodoList.length > 0) {
      let temp = [...baseTodoList];
      temp.sort((a, b) => {
        if (isSortByComplete) {
          return Number(a.check) - Number(b.check);
        }
        if (isSortByDate) {
          let dateA = new Date(a.date).getTime();
          let dateB = new Date(b.date).getTime();
          if (dateA < dateB) return -1;
          else return 1;
        }
        if (isSortByRecipient) {
          return a.recipient.localeCompare(b.recipient);
        }
        if (isSortBySender) {
          return a.name.localeCompare(b.name);
        }
      });
      setTodoList(() => temp.map((x) => x));
    }
  }, [isSortByComplete, isSortByDate, isSortByRecipient, isSortBySender, baseTodoList]);
  return (
    <div className="todo">
      <div className="todo title">{t("todo.TODO LIST")}</div>
      <div className="todo showcase-section">
        <Table className="todo showcase" id="todo-table">
          <thead>
            <tr>
              <th className="cursor-pointer" onClick={() => setIsSortByDate(!isSortByDate)}>
                {t("todo.Date")}
              </th>
              <th className="cursor-pointer" onClick={() => setIsSortBySender(!isSortBySender)}>
                {" "}
                {t("todo.Sender")}
              </th>
              <th className="cursor-pointer" onClick={() => setIsSortByRecipient(!isSortByRecipient)}>
                {t("todo.Recipient")}
              </th>
              <th> {t("todo.Message")}</th>
              <th className="cursor-pointer" onClick={() => setIsSortByComplete(!isSortByComplete)}>
                {" "}
                {t("todo.Complete?")}
              </th>
              <th className="cursor-pointer"> {t("todo.Delete")}</th>
            </tr>
          </thead>
          <tbody>
            {todoList.length > 0 ? (
              todoList.map((todo, index) => (
                <tr key={"todo-" + index} className={todo.check ? "del" : ""}>
                  <td>{todo.date}</td>
                  <td>{todo.name}</td>
                  <td>{todo.recipient}</td>
                  <td>{todo.message}</td>
                  <td>
                    <input type="checkbox" checked={todo.check} onChange={() => changeTodo(todo.key, !todo.check)}></input>
                  </td>
                  <td className="cursor-pointer" onClick={() => deleteTodo(todo.key)}>
                    <div>
                      <FaTrashAlt />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>
                  <div> {t("todo.Nothing in here.")}</div>
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
