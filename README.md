# Welcome to SPR-Management-Portal
This Portal is an internship project that will be used in real store. At first, the goal of the project is to fix bugs in the old site running in PHP. However, due to the amount of free time from the internship, I have rewrote the project using ReactJS and Firebase.
<ins>Demo</ins>: [Deployed with Firebase](https://spr-kirppis-kok.web.app/)

# Tech used
![Generic badge](https://img.shields.io/badge/React-v.18.2-orange.svg)
![Generic badge](https://img.shields.io/badge/ReactBootstrap-v.2.4.0-8A2BE2.svg)
![Generic badge](https://img.shields.io/badge/Firebase-v.9.8.2-yellow.svg)
![Generic badge](https://img.shields.io/badge/i18next-v.21.9.0-#009687.svg)
![Generic badge](https://img.shields.io/badge/formik-v.2.2.9-#172B4D.svg)

# Guide
## 1. Running locally
Just like any other Reactjs project, you need to run **npm run start** using a terminal.
Or, you can go to the **build** directory and run the **.html** file. The directory is made to host into Firebase server.
This is a showcase project so it will have limited features, and the data in Firebase is just one snapshot from Firebase.

## 2. This project includes
* A full database of all the employees working in the store.
* Monitoring the time employees log in or out, and can manually log them if needed.
* A text message service that employees can send their messages directly to the manager.
* A to-do list for the manager.
* A file transfer system using SFTP to send the employee's salaries directly to a government agency (disabled in the showcase version).
* Extract employee's data into XLS/PDF file (disabled in showcase version).

## 3. Project Structure
<details>
<summary>Open Project Structure</summary>

```bash
frontend/
├─ firebase/
├─ public/
│  ├─ favicon.ico
│  ├─ index.html
│  ├─ robots.txt
├─ src/
│  ├─ component/
│  │  ├─ employee-management/
│  │  │  ├─ EditEmployee.js
│  │  │  ├─ EmployeeByGroup.js
│  │  │  ├─ EmployeeManagement.js
│  │  │  ├─ ModalAddingEmp.js
│  │  │  ├─ ModalAddingGroup.js
│  │  │  ├─ ModalDeletingGroup.js
│  │  ├─ extra/
│  │  │  ├─ Extra.js
│  │  │  ├─ Help.js
│  │  │  ├─ Loading.js
│  │  │  ├─ Setting.js
│  │  │  ├─ WindowDimension.js
│  │  ├─ message-components/
│  │  │  ├─ ForEmployees.js
│  │  │  ├─ ForEmployers.js
│  │  ├─ report-components/
│  │  │  ├─ CompareTimeStamp.js
│  │  │  ├─ ModalForAddRecord.js
│  │  │  ├─ ModalForDeletingRecord.js
│  │  │  ├─ Report.js
│  │  │  ├─ ReportByPerson.js
│  │  │  ├─ ReportTimeStamp.js
│  │  │  ├─ ScheduleForReport.js
│  │  ├─ report-workday/
│  │  │  ├─ ModalForDayStatus.js
│  │  │  ├─ ReportWorkday.js
│  │  │  ├─ WorkdayByPerson.js
│  │  │  ├─ WorkdaySpecial.js
│  │  │  ├─ WorkdayTimestamp.js
│  │  ├─ schedule-components/
│  │  │  ├─ Schedule.js
│  │  │  ├─ ScheduleByGroup.js
│  │  │  ├─ ScheduleByPerson.js
│  │  │  ├─ ScheduleUpload.js
│  │  ├─ todo-components/
│  │  │  ├─ Todo.js
│  │  ├─ EmployeeList.js
│  │  ├─ ErrorPage.js
│  │  ├─ Footer.js
│  │  ├─ FunctionSelector.js
│  │  ├─ Header.js
│  │  ├─ Management.js
│  │  ├─ StoreDatabase.js
│  │  ├─ StoreSelectable.js
│  │  ├─ User.js
│  ├─ css/
│  ├─ img/
│  ├─ js/
│  ├─ locale/
│  ├─ App.js
│  ├─ index.js
├─ .gitignore
├─ package.json
├─ README.md

```
</details>

## 4. Advanced Configuration
Every configuration implementation needs to go through Janno, who is the manager of SPR-Kirppis. He owns the final version of the site and the Android Application.
