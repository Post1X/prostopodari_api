export default function (datetoparse) {
    return datetoparse.map((date) => {
        const parsedDate = new Date(date)
        const year = parsedDate.getUTCFullYear();
        const month = parsedDate.getUTCMonth() + 1
        const day = parsedDate.getUTCDate();
        const hours = parsedDate.getUTCHours();
        const minutes = parsedDate.getUTCMinutes();
        const seconds = parsedDate.getUTCSeconds();
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.000Z`
    })
}