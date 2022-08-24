function CompareTimeStamp(props) {
  const arr = props.arr;
  if (arr) {
      return (
        <label>
          {arr[0]} - {arr[1]}
        </label>
      );
  }
}

export default CompareTimeStamp;
