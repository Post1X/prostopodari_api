const currentDate = new Date();
const day = currentDate.getDate();
const month = currentDate.getMonth() + 1;
const year = currentDate.getFullYear() % 100;

function addLeadingZero(number) {
    return number < 10 ? '0' + number : number;
}

export const formattedDate = `${addLeadingZero(day)}.${addLeadingZero(month)}.${addLeadingZero(year)}`;
