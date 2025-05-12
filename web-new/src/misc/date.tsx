export const getDate = (dateString: string) => {
    return new Date(dateString);
}

const pluralizer = (num: number) => {
    return (num == 1 ? "" : "s");
}

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

// get formatted difference between dates
const getDifference = (date1: Date, date2: Date) => {
    let difference = date1.valueOf() - date2.valueOf();

    // get seconds
    let seconds = Math.round(difference/1000);
    if (seconds < 60)
        return "Less than a minute ago"

    // get minutes
    let minutes = Math.round(seconds/60);
    if (minutes < 60)
        return minutes + " minute" + pluralizer(minutes) + " ago"

    // get hours
    let hours = Math.round(minutes/60);
    if (hours < 24)
        return hours + " hour" + pluralizer(hours) + " ago"
    
    // get days
    let days = Math.round(hours/24);
    if (days < 5)
        return days + " day" + pluralizer(days) + " ago"

    // if current year
    if (date1.getFullYear() == date2.getFullYear())
        return date2.getDate() + " " + months[date2.getMonth() - 1]
    
    // general case
    return date2.toDateString();
}

export const getRelativeDate = (dateString: string) => {
    let currentDate = new Date();
    let date = new Date(dateString);

    return getDifference(currentDate, date);
}