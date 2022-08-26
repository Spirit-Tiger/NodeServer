export const getDate = () => {
    const today = new Date();
    const month = String(today.getMonth()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");
    const seconds = String(today.getSeconds()).padStart(2, "0");
    const date = today.getFullYear() + "/" + month + "/" + today.getDate();
    const time = today.getHours() + ":" + minutes + ":" + seconds;
    const dateTime = date + " " + time;
    return dateTime;
  };