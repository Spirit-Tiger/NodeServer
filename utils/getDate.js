export const getDate = () => {
    const today = new Date();
    const month = String(today.getMonth()+1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");
    const seconds = String(today.getSeconds()).padStart(2, "0");
    const date = today.getFullYear() + "/" + month + "/" + day;
    const time = today.getHours() + ":" + minutes + ":" + seconds;
    const dateTime = date + " " + time;
    return dateTime;
  };

export const  getProfit = (orderType, openPrice, currentPrice, volume) => {
  let profit;
    if (orderType === "Sell" && currentPrice >= openPrice) {
      profit = openPrice / currentPrice;
      profit *= volume;
      profit -= volume;
       profit = Number(profit.toFixed(2));
    }
    if (orderType === "Sell" && currentPrice <= openPrice) {
      profit = openPrice / currentPrice;
      profit *= volume;
      profit -= volume;
       profit = Number(profit.toFixed(2));
    }
    if (orderType === "Buy" && currentPrice <= openPrice) {
      profit = currentPrice / openPrice;
      profit *= volume;
      profit -= volume;
       profit = Number(profit.toFixed(2));
    }
    if (orderType === "Buy" && currentPrice >= openPrice) {
      profit = currentPrice / openPrice;
      profit *= volume;
      profit -= volume;
      profit = Number(profit.toFixed(2));
    }
    return profit;
}  