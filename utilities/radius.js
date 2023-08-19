export async function checkIfInside(lat1, lon1, lon2, lat2) {
    const radius = 2000;
    console.log(lon1, lat1, 'first')
    console.log(lon2, lat2, 'sec')
    let newRadius = calcCrow(lat1, lon1, lon2, lat2);
    console.log(newRadius, 'newRad')
    return newRadius;
}

function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

function toRad(Value) {
    return Value * Math.PI / 180;
}
